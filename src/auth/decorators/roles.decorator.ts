import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enum/user-role.enum.js';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
