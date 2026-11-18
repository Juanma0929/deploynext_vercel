/** A user as GET/POST/PATCH /users return it, without its secrets. */
export interface UserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;
}

/** Body of POST /users. */
export interface CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
}

/** Body of PATCH /users/:id. The API answers 400 if `email` is sent. */
export interface UpdateUserDto {
  readonly name?: string;
  readonly password?: string;
  readonly role?: string;
  readonly isActive?: boolean;
}
