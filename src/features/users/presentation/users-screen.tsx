"use client";

import { useId, useMemo, useState } from "react";

import { paginate } from "@/shared/domain/collections";
import { ROLE_LABELS, ROLES, isRole } from "@/shared/domain/role";
import { Dialog } from "@/shared/presentation/dialog";
import { Pagination } from "@/shared/presentation/pagination";

import type { User } from "../domain/user";
import { EMPTY_USER_FILTERS, filterUsers, type UserFilters } from "../domain/user-filters";
import { isSelf } from "../domain/user-policy";
import { DeactivateUserConfirmation } from "./deactivate-user-confirmation";
import { useUsers } from "./use-users";
import { UserForm } from "./user-form";
import { UsersProvider } from "./users-context";

const PAGE_SIZE = 10;
const NO_USERS: readonly User[] = [];

type Modal =
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
  const [filters, setFilters] = useState<UserFilters>(EMPTY_USER_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [modal, setModal] = useState<Modal>({ kind: "none" });
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

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
    if (message !== undefined) setNotice({ tone: "ok", text: message });
  }

  async function handleReactivate(user: User) {
    const result = await reactivate(user);
    setNotice(
      result.ok
        ? { tone: "ok", text: `${user.name} puede volver a iniciar sesión.` }
        : { tone: "error", text: result.message },
    );
  }

  return (
    <section aria-labelledby="users-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="users-title" className="text-2xl font-semibold">
            Usuarios
          </h1>
          <p className="text-muted text-sm">Crea cuentas, cambia roles y desactiva usuarios.</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ kind: "create" })}
          className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          Nuevo usuario
        </button>
      </header>

      {notice !== null && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
            notice.tone === "error"
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-green-300 bg-green-50 text-green-900"
          }`}
        >
          <p className="flex-1">{notice.text}</p>
          <button type="button" onClick={() => setNotice(null)} className="font-medium underline">
            Cerrar
          </button>
        </div>
      )}

      <FiltersBar filters={filters} onChange={changeFilters} />

      {list.status === "loading" && (
        <p role="status" className="text-muted text-sm">
          Cargando usuarios…
        </p>
      )}

      {list.status === "error" && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          <p>{list.message}</p>
          <button type="button" onClick={reload} className="font-medium underline">
            Reintentar
          </button>
        </div>
      )}

      {list.status === "ready" && (
        <>
          {page.items.length === 0 ? (
            <p className="text-muted rounded-md border border-dashed border-slate-300 p-6 text-center text-sm">
              {users.length === 0 ? "Todavía no hay usuarios." : "Ningún usuario coincide con la búsqueda."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="text-muted border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Nombre</th>
                    <th scope="col" className="px-4 py-3 font-medium">Correo</th>
                    <th scope="col" className="px-4 py-3 font-medium">Rol</th>
                    <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {page.items.map((user) => {
                    const own = isSelf(currentUserId, user);
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 font-medium">
                          {user.name}
                          {own && <span className="text-muted font-normal"> (tú)</span>}
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                        <td className="px-4 py-3">
                          <StatusBadge isActive={user.isActive} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setModal({ kind: "edit", user })}
                              className="text-primary font-medium hover:underline"
                              aria-label={`Editar a ${user.name}`}
                            >
                              Editar
                            </button>
                            {user.isActive ? (
                              <button
                                type="button"
                                disabled={own}
                                title={own ? "No puedes desactivar tu propia cuenta." : undefined}
                                onClick={() => setModal({ kind: "deactivate", user })}
                                className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                                aria-label={`Desactivar a ${user.name}`}
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleReactivate(user)}
                                className="font-medium text-green-700 hover:underline"
                                aria-label={`Reactivar a ${user.name}`}
                              >
                                Reactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} onPageChange={setPageNumber} noun="usuarios" />
        </>
      )}

      <Dialog open={modal.kind === "create"} title="Nuevo usuario" onClose={() => close()}>
        <UserForm onDone={() => close("Usuario creado.")} onCancel={() => close()} />
      </Dialog>

      <Dialog open={modal.kind === "edit"} title="Editar usuario" onClose={() => close()}>
        {modal.kind === "edit" && (
          <UserForm
            key={modal.user.id}
            user={modal.user}
            onDone={() => close("Cambios guardados.")}
            onCancel={() => close()}
          />
        )}
      </Dialog>

      <Dialog open={modal.kind === "deactivate"} title="¿Desactivar este usuario?" onClose={() => close()}>
        {modal.kind === "deactivate" && (
          <DeactivateUserConfirmation
            user={modal.user}
            onDone={() => close(`${modal.user.name} fue desactivado y ya no puede iniciar sesión.`)}
            onCancel={() => close()}
          />
        )}
      </Dialog>
    </section>
  );
}

interface FiltersBarProps {
  readonly filters: UserFilters;
  readonly onChange: (next: Partial<UserFilters>) => void;
}

function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const ids = { term: useId(), role: useId(), status: useId() };
  const control =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <search className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.term} className="text-xs font-medium">Buscar</label>
        <input
          id={ids.term}
          type="search"
          placeholder="Nombre o correo"
          value={filters.term}
          onChange={(event) => onChange({ term: event.target.value })}
          className={control}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.role} className="text-xs font-medium">Rol</label>
        <select
          id={ids.role}
          value={filters.role ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ role: isRole(value) ? value : null });
          }}
          className={control}
        >
          <option value="">Todos</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.status} className="text-xs font-medium">Estado</label>
        <select
          id={ids.status}
          value={filters.status ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onChange({ status: value === "active" || value === "inactive" ? value : null });
          }}
          className={control}
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </search>
  );
}

function StatusBadge({ isActive }: { readonly isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
