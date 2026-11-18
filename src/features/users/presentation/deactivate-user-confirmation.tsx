"use client";

import { useState } from "react";

import { Alert, Button, ModalActions } from "@/shared/presentation/ui";

import type { User } from "../domain/user";
import { useUsers } from "./use-users";

interface DeactivateUserConfirmationProps {
  readonly user: User;
  readonly onDone: () => void;
  readonly onCancel: () => void;
}

/** "Delete" is a deactivation: this says so, and what it means, before doing it. */
export function DeactivateUserConfirmation({ user, onDone, onCancel }: DeactivateUserConfirmationProps) {
  const { deactivate } = useUsers();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function confirm() {
    setIsSaving(true);
    setError(null);
    const result = await deactivate(user);
    setIsSaving(false);

    if (result.ok) onDone();
    else setError(result.message);
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p>
        <span className="font-medium">{user.name}</span> ({user.email}) <strong>perderá el acceso de
        inmediato</strong>: no podrá iniciar sesión y, si tiene una sesión abierta, sus próximas
        acciones serán rechazadas.
      </p>
      <p className="text-muted">
        La cuenta no se borra: su historial de ventas se conserva y puedes reactivarla cuando quieras.
      </p>

      {error !== null && (
        <Alert tone="danger">
          <p>{error}</p>
        </Alert>
      )}

      <ModalActions>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={confirm} isLoading={isSaving} loadingText="Desactivando…">
          Desactivar usuario
        </Button>
      </ModalActions>
    </div>
  );
}
