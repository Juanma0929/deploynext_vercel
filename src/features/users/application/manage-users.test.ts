import { describe, expect, it } from "vitest";

import { ConflictError, DomainError } from "@/shared/domain/app-error";

import { NewUser, User, type UserChanges } from "../domain/user";
import type { UserRepository } from "../domain/user.repository";
import { ChangeUserRole, CreateUser, ListUsers, SetUserActive } from "./manage-users";

const admin = new User({
  id: "u-1",
  name: "Ana Admin",
  email: "admin@stockpyme.com",
  role: "admin",
  isActive: true,
});

const seller = new User({
  id: "u-2",
  name: "Beto Vendedor",
  email: "seller@stockpyme.com",
  role: "seller",
  isActive: true,
});

class FakeUserRepository implements UserRepository {
  readonly updates: Array<{ id: string; changes: UserChanges }> = [];
  readonly created: NewUser[] = [];

  constructor(private readonly users: User[] = [admin, seller]) {}

  async list(): Promise<User[]> {
    return this.users;
  }

  async getById(id: string): Promise<User> {
    const found = this.users.find((user) => user.id === id);
    if (found === undefined) throw new Error("not found");
    return found;
  }

  async create(user: NewUser): Promise<User> {
    this.created.push(user);
    return new User({
      id: "u-3",
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: true,
    });
  }

  async update(id: string, changes: UserChanges): Promise<User> {
    this.updates.push({ id, changes });
    return this.getById(id);
  }
}

describe("ListUsers", () => {
  it("returns every user, active and inactive", async () => {
    await expect(new ListUsers(new FakeUserRepository()).execute()).resolves.toHaveLength(2);
  });
});

describe("CreateUser", () => {
  it("normalises the email and keeps the role", async () => {
    const repository = new FakeUserRepository();

    const created = await new CreateUser(repository).execute({
      name: "  Carla  ",
      email: "CARLA@stockpyme.com",
      password: "Carla12345",
      role: "seller",
    });

    expect(repository.created[0]?.email).toBe("carla@stockpyme.com");
    expect(created.name).toBe("Carla");
    expect(created.role).toBe("seller");
  });

  it("rejects a password shorter than the API accepts, without a request", async () => {
    const repository = new FakeUserRepository();

    await expect(
      new CreateUser(repository).execute({
        name: "Carla",
        email: "carla@stockpyme.com",
        password: "corta",
        role: "seller",
      }),
    ).rejects.toBeInstanceOf(DomainError);
    expect(repository.created).toHaveLength(0);
  });
});

describe("ChangeUserRole", () => {
  it("changes the role of another user", async () => {
    const repository = new FakeUserRepository();

    await new ChangeUserRole(repository).execute(seller.id, "admin", admin.id);

    expect(repository.updates[0]).toEqual({ id: "u-2", changes: { role: "admin" } });
  });

  it("refuses to let an administrator demote themselves", async () => {
    const repository = new FakeUserRepository();

    await expect(
      new ChangeUserRole(repository).execute(admin.id, "seller", admin.id),
    ).rejects.toBeInstanceOf(ConflictError);
    // Nothing travelled: the rule is checked before the request.
    expect(repository.updates).toHaveLength(0);
  });
});

describe("SetUserActive", () => {
  it("deactivates instead of deleting, which the API does not allow", async () => {
    const repository = new FakeUserRepository();

    await new SetUserActive(repository).execute(seller.id, false, admin.id);

    expect(repository.updates[0]).toEqual({ id: "u-2", changes: { isActive: false } });
  });

  it("refuses to let an administrator lock themselves out", async () => {
    const repository = new FakeUserRepository();

    await expect(
      new SetUserActive(repository).execute(admin.id, false, admin.id),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("lets an administrator reactivate themselves, which locks nobody out", async () => {
    const repository = new FakeUserRepository();

    await new SetUserActive(repository).execute(admin.id, true, admin.id);

    expect(repository.updates[0]?.changes).toEqual({ isActive: true });
  });
});
