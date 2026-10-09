import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto.js';
import { UserResponseDto } from './user-response.dto.js';

export class UsersResponseDto {
  data: UserResponseDto[];
  meta: PaginationMetaDto;
}
