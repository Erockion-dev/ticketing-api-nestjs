import { UserRole } from '../enum/user-role.enum.js';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
