import { DomainError } from "@/shared/domain/errors";

import type { User } from "./user";
import type { UserChanges } from "./user-input";

/**
 * An admin cannot lock itself out: neither deactivate its own account nor
 * take away its own role. The API allows both, so the rule lives here.
 */
export class SelfLockoutError extends DomainError {
  constructor() {
    super("No puedes desactivar tu propia cuenta ni cambiar tu propio rol.");
    this.name = "SelfLockoutError";
  }
}

export function isSelf(actorId: string, target: User): boolean {
  return actorId === target.id;
}

/** Whether these changes would lock the actor out of its own account. */
export function wouldLockOut(actorId: string, target: User, changes: UserChanges): boolean {
  if (!isSelf(actorId, target)) return false;

  const deactivates = changes.isActive === false;
  const changesRole = changes.role !== undefined && changes.role !== target.role;
  return deactivates || changesRole;
}

export function assertNoSelfLockout(actorId: string, target: User, changes: UserChanges): void {
  if (wouldLockOut(actorId, target, changes)) throw new SelfLockoutError();
}
