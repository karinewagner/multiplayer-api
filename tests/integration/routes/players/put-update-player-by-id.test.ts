import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { PlayerController } from '../../../../src/controllers/player.controller';
import { PlayerRepository } from '../../../../src/repositories/player.repository';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/player.repository');

const app = express();
app.use(express.json());
app.put('/players/:id', PlayerController.updatePlayerById);

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

describe('PUT /players/:id - Integração (mock)', () => {
  it('deve atualizar dados do jogador', async () => {
    const mockPlayer = {
      id: '1',
      name: 'Carlos Atualizado',
      nickname: 'carluxo',
      email: 'carluxo@email.com',
    };

    (PlayerRepository.updatePlayerById as jest.Mock).mockResolvedValue(mockPlayer);

    const res = await request(app).put('/players/1').send({
      name: 'Carlos Atualizado',
      nickname: 'carluxo'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Dados atualizados com sucesso!',
      updatePlayer: {
        id: '1',
        name: 'Carlos Atualizado',
        nickname: 'carluxo',
        email: 'carluxo@email.com'
      }
    });
  });
});
