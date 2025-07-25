import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchService } from '../../../../src/services/match.service';
import { DomainError } from '../../../../src/errors/domain.error';
import { ValidationError } from '../../../../src/errors/validation.error';
import { NotFoundError } from '../../../../src/errors/not-found.error';

jest.mock('../../../../src/services/match.service');

const app = express();
app.use(express.json());

app.get('/matches/history/:playerId', MatchController.getPlayerHistory);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  res.status(500).json({ error: 'InternalServerError', message: 'Erro interno no servidor.' });
});

describe('GET /matches/history/:playerId - Integração (mock)', () => {
  const playerId = 'player-123';

  const mockHistory = [
    {
      id: 'match-1',
      name: 'Match 1',
      state: 'FINISHED',
      scores: { [playerId]: 100 },
      players: [],
    },
    {
      id: 'match-2',
      name: 'Match 2',
      state: 'FINISHED',
      scores: { [playerId]: 200 },
      players: [],
    },
  ];

  it('deve retornar o histórico de partidas do jogador', async () => {
    (MatchService.getPlayerHistory as jest.Mock).mockResolvedValue(mockHistory);

    const res = await request(app).get(`/matches/history/${playerId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2);
  });

  it('deve retornar 400 se o playerId estiver ausente', async () => {
    const res = await request(app).get(`/matches/history/`);

    expect(res.statusCode).toBe(404);
  });

  it('deve retornar 404 se não houver histórico para o jogador', async () => {
    (MatchService.getPlayerHistory as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get(`/matches/history/${playerId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nenhum histórico encontrado para este jogador.');
  });
});
