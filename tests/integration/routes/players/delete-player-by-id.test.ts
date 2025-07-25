import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { PlayerController } from '../../../../src/controllers/player.controller';
import { PlayerRepository } from '../../../../src/repositories/player.repository';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/player.repository');

const app = express();
app.use(express.json());
app.delete('/players/:id', PlayerController.deletePlayerById);

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

describe('DELETE /players/:id - Integração (mock)', () => {
  it('deve excluir um jogador com sucesso', async () => {
    (PlayerRepository.deletePlayerById as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/players/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Jogador excluído com sucesso!' });
  });
});
