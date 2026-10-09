import { Test, TestingModule } from '@nestjs/testing';
import { OperatorTicketsController } from './operator-tickets.controller.js';
import { OperatorTicketsService } from './operator-tickets.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';

describe('OperatorTicketsController', () => {
  let controller: OperatorTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatorTicketsController],
      providers: [
        {
          provide: OperatorTicketsService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OperatorTicketsController>(OperatorTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
