import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchService } from '../../../../src/services/match.service';
import { DomainError } from '../../../../src/errors/domain.error';
import { ValidationError } from '../../../../src/errors/validation.error';
import { NotFoundError } from '../../../../src/errors/not-found.error';
import { ConflictError } from '../../../../src/errors/conflict.error';

jest.mock('../../../../src/services/match.service');

const app = express();
app.use(express.json());

app.post('/matches/:matchId/leave/:playerId', MatchController.removePlayerFromMatch);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  res.status(500).json({ error: 'InternalServerError', message: 'Erro interno no servidor.' });
});

describe('POST /matches/:matchId/leave/:playerId - Integração (mock)', () => {
  it('deve remover o jogador da partida com sucesso', async () => {
    const mockMatch = {
      id: 'match-id',
      name: 'Partida',
      state: 'WAITING',
      players: [],
    };

    (MatchService.leaveMatch as jest.Mock).mockResolvedValue(mockMatch);

    const res = await request(app).post('/matches/match-id/leave/player-id');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'match-id');
  });

  it('deve retornar erro se matchId ou playerId estiverem ausentes', async () => {
    const res = await request(app).post('/matches//leave/');

    expect(res.statusCode).toBe(404);
  });

  it('deve retornar 404 se partida não for encontrada', async () => {
    (MatchService.leaveMatch as jest.Mock).mockRejectedValue(
      new NotFoundError('Partida não encontrada.')
    );

    const res = await request(app).post('/matches/invalida/leave/player-id');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Partida não encontrada.');
  });

  it('deve retornar 404 se jogador não for encontrado', async () => {
    (MatchService.leaveMatch as jest.Mock).mockRejectedValue(
      new NotFoundError('Jogador não encontrado.')
    );

    const res = await request(app).post('/matches/match-id/leave/invalido');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Jogador não encontrado.');
  });

  it('deve retornar 409 se jogador não estiver na partida', async () => {
    (MatchService.leaveMatch as jest.Mock).mockRejectedValue(
      new ConflictError('O jogador não está participando desta partida.')
    );

    const res = await request(app).post('/matches/match-id/leave/player-id');

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('O jogador não está participando desta partida.');
  });
});
