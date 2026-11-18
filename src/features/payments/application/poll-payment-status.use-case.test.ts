import { describe, expect, it } from "vitest";

import { PaymentGatewayError } from "../domain/errors";
import type { PaymentRequest } from "../domain/payment-request";
import type { PaymentRepository, StartedPayment } from "../domain/payment.repository";
import type { PaymentStatusResult, SalePaymentStatus } from "../domain/payment-status";
import { CheckPaymentStatusUseCase } from "./check-payment-status.use-case";
import { PollPaymentStatusUseCase, type PollingClock } from "./poll-payment-status.use-case";

const SALE_ID = "9f1c2b3a-0000-4000-8000-000000000001";

/** A fake of the API that answers the statuses it was given, in order, and then repeats the last one. */
class FakePaymentRepository implements PaymentRepository {
  checks = 0;

  constructor(private readonly answers: readonly (SalePaymentStatus | Error)[]) {}

  async checkStatus(): Promise<PaymentStatusResult> {
    const answer = this.answers[Math.min(this.checks, this.answers.length - 1)];
    this.checks += 1;
    if (answer === undefined) throw new Error("The fake has no answers.");
    if (answer instanceof Error) throw answer;
    return { status: answer, transactionId: "tx-1" };
  }

  charge(_saleId: string, _request: PaymentRequest): Promise<StartedPayment> {
    throw new Error("Not used by this use case.");
  }
}

/** A clock that moves only when the use case waits: no real seconds go by. */
class FakeClock implements PollingClock {
  time = 0;
  readonly waits: number[] = [];

  now(): number {
    return this.time;
  }

  async wait(ms: number): Promise<void> {
    this.waits.push(ms);
    this.time += ms;
  }
}

const POLICY = { intervalMs: 2_500, maxDurationMs: 60_000 };

function setup(answers: readonly (SalePaymentStatus | Error)[]) {
  const repository = new FakePaymentRepository(answers);
  const clock = new FakeClock();
  const poll = new PollPaymentStatusUseCase(new CheckPaymentStatusUseCase(repository), clock, POLICY);
  return { repository, clock, poll };
}

describe("PollPaymentStatusUseCase", () => {
  it("asks again while the payment is pending, and stops when it is paid", async () => {
    const { repository, clock, poll } = setup(["pending", "pending", "paid"]);

    const outcome = await poll.execute(SALE_ID);

    expect(outcome).toEqual({ kind: "settled", status: "paid" });
    expect(repository.checks).toBe(3);
    // One wait between each pair of checks, of the interval of the policy.
    expect(clock.waits).toEqual([2_500, 2_500]);
  });

  it("stops at the first check when the payment is already final", async () => {
    const { repository, clock, poll } = setup(["declined"]);

    expect(await poll.execute(SALE_ID)).toEqual({ kind: "settled", status: "declined" });
    expect(repository.checks).toBe(1);
    expect(clock.waits).toEqual([]);
  });

  it("gives up after the whole minute if it is still pending", async () => {
    const { repository, clock, poll } = setup(["pending"]);

    expect(await poll.execute(SALE_ID)).toEqual({ kind: "timeout" });
    // 60 s / 2.5 s: the last check ends exactly at the minute, and no check starts after it.
    expect(repository.checks).toBe(25);
    expect(clock.now()).toBe(60_000);
  });

  it("stops on an error of a check and passes it on (502: Wompi did not answer)", async () => {
    const { repository, poll } = setup(["pending", new PaymentGatewayError()]);

    await expect(poll.execute(SALE_ID)).rejects.toBeInstanceOf(PaymentGatewayError);
    expect(repository.checks).toBe(2);
  });

  it("stops when whoever asked leaves the screen", async () => {
    const { repository, clock, poll } = setup(["pending"]);
    const controller = new AbortController();
    clock.wait = async (ms) => {
      clock.time += ms;
      controller.abort();
    };

    expect(await poll.execute(SALE_ID, controller.signal)).toEqual({ kind: "aborted" });
    expect(repository.checks).toBe(1);
  });

  it("refuses an id that is not a UUID without asking the API", async () => {
    const { repository, poll } = setup(["paid"]);

    await expect(poll.execute("no-es-uuid")).rejects.toThrow("La venta no existe");
    expect(repository.checks).toBe(0);
  });
});
