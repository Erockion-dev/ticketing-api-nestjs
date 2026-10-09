import { UserSummaryDto } from '../../users/dto/user-summary.dto.js';

export class TicketcommentSummaryDto {
  id: number;
  content: string;
  createdBy: UserSummaryDto;
  createdAt: Date;
}
