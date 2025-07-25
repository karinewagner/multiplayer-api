import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchRepository } from '../../../../src/repositories/match.repository';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/match.repository');

const app = express();
app.use(express.json());

app.get('/matches/open', MatchController.getOpenMatches);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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

describe('GET /matches/open - Integração (mock)', () => {
  it('deve retornar as partidas abertas com status 200', async () => {
    const mockOpenMatches = [
      {
        id: '1',
        name: 'Partida A',
        state: 'WAITING',
        startDate: null,
        scores: null,
        players: [],
      },
      {
        id: '2',
        name: 'Partida B',
        state: 'WAITING',
        startDate: null,
        scores: null,
        players: [],
      },
    ];

    (MatchRepository.findOpenMatches as jest.Mock).mockResolvedValue(mockOpenMatches);

    const res = await request(app).get('/matches/open');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).not.toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  it('deve retornar erro 404 se não houver partidas abertas', async () => {
    (MatchRepository.findOpenMatches as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/matches/open');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Nenhuma partida aberta encontrada.',
    });
  });
});
