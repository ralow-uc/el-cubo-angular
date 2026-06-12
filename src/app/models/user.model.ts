export type Role = 'admin' | 'cliente';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  birthdate: string;
  address: string;
  role: Role;
  createdAt: string;
}

export interface Session {
  userId: string;
  role: Role;
}
