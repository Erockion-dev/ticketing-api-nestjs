import { Test, TestingModule } from '@nestjs/testing';
import { AdminTicketsController } from './admin-tickets.controller.js';
import { AdminTicketsService } from './admin-tickets.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

describe('AdminTicketsController', () => {
  let controller: AdminTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTicketsController],
      providers: [
        {
          provide: AdminTicketsService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminTicketsController>(AdminTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
