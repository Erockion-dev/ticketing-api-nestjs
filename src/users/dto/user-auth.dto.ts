import { UserRole } from '../enum/user-role.enum.js';

export class UserAuthDto {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}
