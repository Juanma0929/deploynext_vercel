/** The JSON the API speaks for a user. The password never comes back. */
export interface UserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
}

export interface CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
}

/** PATCH /users/:id. Every field is optional and the email is not among them. */
export interface UpdateUserDto {
  readonly name?: string;
  readonly password?: string;
  readonly role?: string;
  readonly isActive?: boolean;
}
