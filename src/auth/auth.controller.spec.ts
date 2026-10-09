import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

describe('AuthController', () => {
  let controller: AuthController;
  let loginMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    loginMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: loginMock,
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login', () => {
    const loginDto: LoginDto = {
      email: 'admin@test.com',
      password: '123admin',
    };

    controller.login(loginDto);

    expect(loginMock).toHaveBeenCalledWith(loginDto);
  });

  it('should return the result from authService.login.', async () => {
    const loginDto: LoginDto = {
      email: 'test@test.com',
      password: '123test',
    };

    const loginResponse = { access_token: '1234567890' };

    loginMock.mockResolvedValue(loginResponse);

    const response = await controller.login(loginDto);

    expect(response).toEqual(loginResponse);
  });
});
