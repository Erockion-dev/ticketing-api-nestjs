import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketStatus } from '../enum/ticket-status.enum.js';
import { TicketPriority } from '../enum/ticket-priority.enum.js';
import { User } from '../../users/entities/user.entity.js';
import type { TicketComment } from './ticket-comment.entity.js';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.NORMAL,
  })
  priority: TicketPriority;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => User)
  requester: User;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Ticket, (ticket) => ticket.relatedTickets, {
    nullable: true,
  })
  parentTicket: Ticket | null;

  @OneToMany(() => Ticket, (ticket) => ticket.parentTicket)
  relatedTickets: Ticket[];

  @OneToMany('TicketComment', (ticketComment: TicketComment) => ticketComment.ticket)
  ticketComments: TicketComment[];
}
