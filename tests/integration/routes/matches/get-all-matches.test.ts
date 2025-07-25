import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchRepository } from '../../../../src/repositories/match.repository';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/match.repository');

const app = express();
app.use(express.json());

app.get('/matches', MatchController.getAllMatches);

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

describe('GET /matches - Integração (mock)', () => {
  it('deve retornar a lista de partidas com status 200', async () => {
    (MatchRepository.findAllMatches as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'Partida 1',
        state: 'WAITING',
        startDate: null,
        scores: null,
        players: [],
      },
      {
        id: '2',
        name: 'Partida 2',
        state: 'IN_PROGRESS',
        startDate: new Date(),
        scores: null,
        players: [],
      },
    ]);

    const res = await request(app).get('/matches');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('state');
  });

  it('deve retornar erro 404 se não houver partidas', async () => {
    (MatchRepository.findAllMatches as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/matches');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Nenhuma partida encontrada.',
    });
  });
});
