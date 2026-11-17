"use client";

import { useMemo, useState } from "react";

import { ROLES } from "@/shared/domain/role";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  InputField,
  Modal,
  PageHeader,
  Pagination,
  ROLE_LABELS,
  SelectField,
  useClientPagination,
  type Column,
} from "@/shared/presentation";

import type { User, UserSnapshot } from "../domain/user";
import { useUsers } from "./use-users";
import { UserForm } from "./user-form";

interface UsersAdminProps {
  /** The administrator using the screen, resolved by the route. */
  readonly currentUserId: string;
  /** The list the route already read on the server. */
  readonly initialUsers: readonly UserSnapshot[];
}

const STATUS_OPTIONS = [
  { value: "active", label: "Solo activos" },
  { value: "inactive", label: "Solo inactivos" },
];

const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

/**
 * The users screen: the list with its filters, the form for a new one, and the
 * two things that can change about an existing user.
 *
 * There is no delete: the API does not allow it, and deactivating is what stops
 * a user from logging in while their sales keep their history.
 */
export function UsersAdmin({ currentUserId, initialUsers }: UsersAdminProps) {
  const { users, isWorking, error, dismissError, createUser, changeRole, setActive } = useUsers(
    currentUserId,
    initialUsers,
  );

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesTerm =
        term.length === 0 ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesRole = role.length === 0 || user.role === role;
      const matchesStatus =
        status.length === 0 || (status === "active" ? user.isActive : !user.isActive);

      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const { page, pageCount, pageItems, setPage } = useClientPagination(filtered, 10);

  const columns: ReadonlyArray<Column<User>> = [
    {
      key: "name",
      header: "Nombre",
      cell: (user) => (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-muted text-xs">{user.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      cell: (user) => (
        <Badge tone={user.isAdmin() ? "info" : "neutral"}>{ROLE_LABELS[user.role]}</Badge>
      ),
    },
    {
      key: "status",
      header: "Estado",
      hideOnMobile: true,
      cell: (user) => (
        <Badge tone={user.isActive ? "success" : "danger"}>
          {user.isActive ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "right",
      cell: (user) => {
        const isSelf = user.id === currentUserId;

        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={isWorking || isSelf}
              title={isSelf ? "No puedes cambiar tu propio rol." : undefined}
              onClick={() => void changeRole(user.id, user.isAdmin() ? "seller" : "admin")}
            >
              {user.isAdmin() ? "Hacer vendedor" : "Hacer administrador"}
            </Button>
            <Button
              variant={user.isActive ? "danger" : "primary"}
              size="sm"
              disabled={isWorking || (isSelf && user.isActive)}
              title={isSelf && user.isActive ? "No puedes desactivar tu cuenta." : undefined}
              onClick={() => void setActive(user.id, !user.isActive)}
            >
              {user.isActive ? "Desactivar" : "Activar"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <section>
      <PageHeader
        title="Usuarios"
        description="Crea cuentas, cambia roles y desactiva usuarios."
        action={<Button onClick={() => setIsFormOpen(true)}>Nuevo usuario</Button>}
      />

      {error !== null && (
        <div className="mb-4 flex items-start gap-2">
          <Alert className="flex-1">{error}</Alert>
          <Button variant="ghost" size="sm" onClick={dismissError}>
            Cerrar
          </Button>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <InputField
          label="Buscar"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nombre o correo"
        />
        <SelectField
          label="Rol"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          options={ROLE_OPTIONS}
          placeholder="Todos"
        />
        <SelectField
          label="Estado"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={STATUS_OPTIONS}
          placeholder="Todos"
        />
      </div>

      <DataTable
        caption="Usuarios del sistema"
        columns={columns}
        rows={pageItems}
        getRowKey={(user) => user.id}
        empty={
          <EmptyState
            title="No hay usuarios para mostrar"
            description={
              users.length === 0
                ? "Todavía no se ha creado ninguna cuenta."
                : "Ningún usuario coincide con los filtros."
            }
          />
        }
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-sm">
          {filtered.length} de {users.length} usuarios
        </p>
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={isFormOpen}
        title="Nuevo usuario"
        onClose={() => setIsFormOpen(false)}
      >
        <UserForm
          isWorking={isWorking}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={async (input) => {
            const created = await createUser(input);
            if (created) setIsFormOpen(false);
            return created;
          }}
        />
      </Modal>
    </section>
  );
}
