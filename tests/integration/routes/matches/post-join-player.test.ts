import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchService } from '../../../../src/services/match.service';
import { ConflictError } from '../../../../src/errors/conflict.error';
import { NotFoundError } from '../../../../src/errors/not-found.error';
import { ValidationError } from '../../../../src/errors/validation.error';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/services/match.service');

const app = express();
app.use(express.json());

app.post('/matches/:matchId/join/:playerId', MatchController.addPlayerToMatch);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  res.status(500).json({ error: 'InternalServerError', message: 'Erro interno no servidor.' });
});

describe('POST /matches/:matchId/join/:playerId - Integração (mock)', () => {
  it('deve adicionar o jogador à partida com sucesso', async () => {
    const mockMatch = { id: 'match-id', name: 'Partida', state: 'WAITING', players: [] };

    (MatchService.joinMatch as jest.Mock).mockResolvedValue(mockMatch);

    const res = await request(app).post('/matches/match-id/join/player-id');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'match-id');
  });

  it('deve retornar 400 se params estiverem ausentes', async () => {
    const res = await request(app).post('/matches//join/');

    expect(res.statusCode).toBe(404);
  });

  it('deve retornar 404 se partida não for encontrada', async () => {
    (MatchService.joinMatch as jest.Mock).mockRejectedValue(
      new NotFoundError('Partida não encontrada.')
    );

    const res = await request(app).post('/matches/invalida/join/player-id');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Partida não encontrada.');
  });

  it('deve retornar 404 se jogador não for encontrado', async () => {
    (MatchService.joinMatch as jest.Mock).mockRejectedValue(
      new NotFoundError('Jogador não encontrado.')
    );

    const res = await request(app).post('/matches/match-id/join/invalido');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Jogador não encontrado.');
  });

  it('deve retornar 409 se jogador já estiver em uma partida', async () => {
    (MatchService.joinMatch as jest.Mock).mockRejectedValue(
      new ConflictError('Jogador já está em uma partida.')
    );

    const res = await request(app).post('/matches/match-id/join/player-id');

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Jogador já está em uma partida.');
  });

  it('deve retornar 409 se partida já estiver cheia', async () => {
    (MatchService.joinMatch as jest.Mock).mockRejectedValue(
      new ConflictError('A partida já está cheia (máximo de 4 jogadores).')
    );

    const res = await request(app).post('/matches/match-id/join/player-id');

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('A partida já está cheia (máximo de 4 jogadores).');
  });

  it('deve retornar 409 se a partida não estiver em estado WAITING', async () => {
    (MatchService.joinMatch as jest.Mock).mockRejectedValue(
      new ConflictError('A partida não está disponível para entrar.')
    );

    const res = await request(app).post('/matches/match-id/join/player-id');

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('A partida não está disponível para entrar.');
  });
});
