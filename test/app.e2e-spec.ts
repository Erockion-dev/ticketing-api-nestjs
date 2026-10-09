import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module.js';
import { UserRole } from '../src/users/enum/user-role.enum.js';

describe('Users profile (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/profile without token should return 401', async () => {
    await request(app.getHttpServer()).get('/users/profile').expect(401);
  });

  it('GET /users/profile with invalid token should return 401', async () => {
    await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  // it('GET /users/profile with valid token should return 200', async () => {
  //   const token = jwtService.sign({
  //     sub: 1,
  //     email: 'test@example.com',
  //     role: UserRole.USER,
  //   });

  //   await request(app.getHttpServer())
  //     .get('/users/profile')
  //     .set('Authorization', `Bearer ${token}`)
  //     .expect(200)
  //     .expect(({ body }) => {
  //       expect(body).toHaveProperty('id');
  //       expect(body).toHaveProperty('email');
  //       expect(body).not.toHaveProperty('password');
  //     });
  // });
});
