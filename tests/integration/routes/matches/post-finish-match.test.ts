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

app.post('/matches/:matchId/finish', MatchController.finishMatchById);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  res.status(500).json({ error: 'InternalServerError', message: 'Erro interno no servidor.' });
});

describe('POST /matches/:matchId/finish - Integração (mock)', () => {
  const mockScores = {
    'player-1': 100,
    'player-2': 200,
  };

  const mockMatch = {
    id: 'match-id',
    name: 'Finalizada',
    state: 'FINISHED',
    scores: mockScores,
    players: [],
  };

  it('deve finalizar a partida com sucesso', async () => {
    (MatchService.finishMatch as jest.Mock).mockResolvedValue(mockMatch);

    const res = await request(app)
      .post('/matches/match-id/finish')
      .send({ scores: mockScores });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('state', 'FINISHED');
    expect(res.body).toHaveProperty('scores');
  });

  it('deve retornar 400 se scores estiver ausente', async () => {
    const res = await request(app)
      .post('/matches/match-id/finish')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Scores devem estar no formato { "playerId": pontuacao }.');
  });

  it('deve retornar 404 se partida não for encontrada', async () => {
    (MatchService.finishMatch as jest.Mock).mockRejectedValue(
      new NotFoundError('Partida não encontrada.')
    );

    const res = await request(app)
      .post('/matches/match-id/finish')
      .send({ scores: mockScores });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Partida não encontrada.');
  });

  it('deve retornar 409 se a partida já estiver finalizada', async () => {
    (MatchService.finishMatch as jest.Mock).mockRejectedValue(
      new ConflictError('A partida já foi finalizada.')
    );

    const res = await request(app)
      .post('/matches/match-id/finish')
      .send({ scores: mockScores });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('A partida já foi finalizada.');
  });

  it('deve retornar 400 se algum playerId não pertencer à partida', async () => {
    (MatchService.finishMatch as jest.Mock).mockRejectedValue(
      new ValidationError('O(s) seguinte(s) jogador(es) não pertence(m) à partida: player-x')
    );

    const res = await request(app)
      .post('/matches/match-id/finish')
      .send({ scores: { 'player-x': 123 } });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('não pertence(m) à partida');
  });
});
