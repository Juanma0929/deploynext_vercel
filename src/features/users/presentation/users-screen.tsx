"use client";

import { useId, useMemo, useState } from "react";

import { paginate } from "@/shared/domain/collections";
import { ROLE_LABELS, ROLES, isRole } from "@/shared/domain/role";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  LoadingText,
  Modal,
  PageHeader,
  Pagination,
  RetryAlert,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
  useToast,
} from "@/shared/presentation/ui";

import type { User } from "../domain/user";
import { EMPTY_USER_FILTERS, filterUsers, type UserFilters } from "../domain/user-filters";
import { isSelf } from "../domain/user-policy";
import { DeactivateUserConfirmation } from "./deactivate-user-confirmation";
import { useUsers } from "./use-users";
import { UserForm } from "./user-form";
import { UsersProvider } from "./users-context";

const PAGE_SIZE = 10;
const NO_USERS: readonly User[] = [];

/** Which modal is open, if any. */
type OpenModal =
  | { readonly kind: "none" }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly user: User }
  | { readonly kind: "deactivate"; readonly user: User };

interface UsersScreenProps {
  /** The logged-in admin. The route reads it from auth and passes it in. */
  readonly currentUserId: string;
}

/** The management of users and roles. Admin only: the app shell guards the route. */
export function UsersScreen({ currentUserId }: UsersScreenProps) {
  return (
    <UsersProvider currentUserId={currentUserId}>
      <UsersManagement />
    </UsersProvider>
  );
}

function UsersManagement() {
  const { list, reload, reactivate, currentUserId } = useUsers();
  const { toast } = useToast();
  const [filters, setFilters] = useState<UserFilters>(EMPTY_USER_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [modal, setModal] = useState<OpenModal>({ kind: "none" });
  /** A failure stays on screen; a success is a toast. */
  const [error, setError] = useState<string | null>(null);

  const users = list.status === "ready" ? list.users : NO_USERS;
  const page = useMemo(
    () => paginate(filterUsers(users, filters), pageNumber, PAGE_SIZE),
    [users, filters, pageNumber],
  );

  function changeFilters(next: Partial<UserFilters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPageNumber(1);
  }

  function close(message?: string) {
    setModal({ kind: "none" });
    if (message !== undefined) toast({ tone: "success", message });
  }

  async function handleReactivate(user: User) {
    setError(null);
    const result = await reactivate(user);
    if (result.ok) toast({ tone: "success", message: `${user.name} puede volver a iniciar sesión.` });
    else setError(result.message);
  }

  return (
    <section aria-labelledby="users-title" className="flex flex-col gap-6">
      <PageHeader
        titleId="users-title"
        title="Usuarios"
        description="Crea cuentas, cambia roles y desactiva usuarios."
        actions={<Button onClick={() => setModal({ kind: "create" })}>Nuevo usuario</Button>}
      />

      {error !== null && (
        <Alert tone="danger" onDismiss={() => setError(null)}>
          <p>{error}</p>
        </Alert>
      )}

      <FiltersBar filters={filters} onChange={changeFilters} />

      {list.status === "loading" && <LoadingText>Cargando usuarios…</LoadingText>}

      {list.status === "error" && <RetryAlert message={list.message} onRetry={reload} />}

      {list.status === "ready" && (
        <>
          {page.items.length === 0 ? (
            <EmptyState>
              {users.length === 0 ? "Todavía no hay usuarios." : "Ningún usuario coincide con la búsqueda."}
            </EmptyState>
          ) : (
            <Table caption="Usuarios">
              <TableHead>
                <TableHeaderCell>Nombre</TableHeaderCell>
                <TableHeaderCell>Correo</TableHeaderCell>
                <TableHeaderCell>Rol</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell>
                  <span className="sr-only">Acciones</span>
                </TableHeaderCell>
              </TableHead>
              <TableBody>
                {page.items.map((user) => {
                  const own = isSelf(currentUserId, user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                        {own && <span className="text-muted font-normal"> (tú)</span>}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                      <TableCell>
                        {user.isActive ? <Badge tone="success">Activo</Badge> : <Badge tone="neutral">Inactivo</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-3 whitespace-nowrap">
                          <Button
                            variant="link"
                            onClick={() => setModal({ kind: "edit", user })}
                            className="text-primary"
                            aria-label={`Editar a ${user.name}`}
                          >
                            Editar
                          </Button>
                          {user.isActive ? (
                            <Button
                              variant="link"
                              disabled={own}
                              title={own ? "No puedes desactivar tu propia cuenta." : undefined}
                              onClick={() => setModal({ kind: "deactivate", user })}
                              className="text-red-600 disabled:text-slate-400 disabled:no-underline"
                              aria-label={`Desactivar a ${user.name}`}
                            >
                              Desactivar
                            </Button>
                          ) : (
                            <Button
                              variant="link"
                              onClick={() => void handleReactivate(user)}
                              className="text-emerald-700"
                              aria-label={`Reactivar a ${user.name}`}
                            >
                              Reactivar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          <Pagination page={page} onPageChange={setPageNumber} noun="usuarios" />
        </>
      )}

      <Modal open={modal.kind === "create"} title="Nuevo usuario" onClose={() => close()}>
        <UserForm onDone={() => close("Usuario creado.")} onCancel={() => close()} />
      </Modal>

      <Modal open={modal.kind === "edit"} title="Editar usuario" onClose={() => close()}>
        {modal.kind === "edit" && (
          <UserForm
            key={modal.user.id}
            user={modal.user}
            onDone={() => close("Cambios guardados.")}
            onCancel={() => close()}
          />
        )}
      </Modal>

      <Modal open={modal.kind === "deactivate"} title="¿Desactivar este usuario?" onClose={() => close()}>
        {modal.kind === "deactivate" && (
          <DeactivateUserConfirmation
            user={modal.user}
            onDone={() => close(`${modal.user.name} fue desactivado y ya no puede iniciar sesión.`)}
            onCancel={() => close()}
          />
        )}
      </Modal>
    </section>
  );
}

interface FiltersBarProps {
  readonly filters: UserFilters;
  readonly onChange: (next: Partial<UserFilters>) => void;
}

function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const ids = { term: useId(), role: useId(), status: useId() };

  return (
    <search className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <Field id={ids.term} label="Buscar">
        <TextInput
          id={ids.term}
          type="search"
          placeholder="Nombre o correo"
          value={filters.term}
          onChange={(event) => onChange({ term: event.target.value })}
        />
      </Field>
      <Field id={ids.role} label="Rol">
        <Select
          id={ids.role}
          value={filters.role ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ role: isRole(value) ? value : null });
          }}
        >
          <option value="">Todos</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
      </Field>
      <Field id={ids.status} label="Estado">
        <Select
          id={ids.status}
          value={filters.status ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ status: value === "active" || value === "inactive" ? value : null });
          }}
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>
      </Field>
    </search>
  );
}
