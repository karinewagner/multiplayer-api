import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { PlayerController } from '../../../../src/controllers/player.controller';
import { PlayerRepository } from '../../../../src/repositories/player.repository';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/player.repository');

const app = express();
app.use(express.json());
app.get('/players/:id', PlayerController.getPlayerById);

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

describe('GET /players/:id - Integração (mock)', () => {
  it('deve retornar um jogador existente', async () => {
    const mockPlayer = {
      id: '1',
      name: 'Carlos',
      nickname: 'carlao',
      email: 'carlos@email.com',
    };

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(mockPlayer);

    const res = await request(app).get('/players/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Carlos',
      nickname: 'carlao',
      email: 'carlos@email.com',
    });
  });

  it('deve retornar 404 se jogador não existir', async () => {
    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/players/1');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Jogador não localizado',
    });
  });
});
