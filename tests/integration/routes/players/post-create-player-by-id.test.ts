import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { PlayerController } from '../../../../src/controllers/player.controller';
import { PlayerRepository } from '../../../../src/repositories/player.repository';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/player.repository');

const app = express();
app.use(express.json());
app.post('/players', PlayerController.createPlayer);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  res.status(500).json({
    error: 'InternalServerError',
    message: 'Erro interno no servidor.',
  });
});

describe('POST /players - Integração (mock)', () => {
  it('deve criar jogador com sucesso', async () => {
    const newPlayer = {
      name: 'Carlos',
      nickname: 'carlao',
      email: 'carlos@email.com'
    };

    (PlayerRepository.createPlayer as jest.Mock).mockResolvedValue({
      id: '1',
      ...newPlayer
    });

    const res = await request(app).post('/players').send(newPlayer);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: '1',
      name: 'Carlos',
      nickname: 'carlao',
      email: 'carlos@email.com',
    });
  });

  it('deve retornar 409 se nickname já estiver em uso', async () => {
    (PlayerRepository.createPlayer as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: { target: ['nickname'] }
    });

    const res = await request(app).post('/players').send({
      name: 'Ana',
      nickname: 'carlao',
      email: 'ana@email.com'
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Este nickname já está em uso.'
    });
  });

  it('deve retornar 409 se email já estiver em uso', async () => {
    (PlayerRepository.createPlayer as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: { target: ['email'] }
    });

    const res = await request(app).post('/players').send({
      name: 'Ana',
      nickname: 'aninha',
      email: 'carlos@email.com'
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Este e-mail já está em uso.'
    });
  });
});
