import { UserRole } from '../../users/enum/user-role.enum.js';

export type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};
