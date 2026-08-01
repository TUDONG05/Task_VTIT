export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export type UserFormValue = Pick<User, 'email' | 'firstName' | 'lastName' | 'avatar'>;
