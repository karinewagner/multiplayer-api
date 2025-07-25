import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';

import { MatchController } from '../../../src/controllers/match.controller';
import { MatchRepository } from '../../../src/repositories/match.repository';
import { MatchService } from '../../../src/services/match.service';
import { DomainError } from '../../../src/errors/domain.error';

jest.mock('../../../src/repositories/match.repository');
jest.mock('../../../src/services/match.service');

const app: Application = express();
app.use(express.json());

app.get('/matches', MatchController.getAllMatches);
app.post('/matches', MatchController.createNewMatch);
app.get('/matches/open', MatchController.getOpenMatches);
app.get('/matches/history/:playerId', MatchController.getPlayerHistory);
app.post('/matches/:matchId/player/:playerId', MatchController.addPlayerToMatch);
app.delete('/matches/:matchId/player/:playerId', MatchController.removePlayerFromMatch);
app.post('/matches/:matchId/start', MatchController.startMatchById);
app.post('/matches/:matchId/finish', MatchController.finishMatchById);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Erro interno no servidor.',
  });
});

describe('MatchController - getAllMatches', () => {
  it('deve retornar todas as partidas', async () => {
    const matches = [
      { id: '1', name: 'Partida 1', state: 'WAITING' },
      { id: '2', name: 'Partida 2', state: 'IN_PROGRESS' },
    ];

    (MatchRepository.findAllMatches as jest.Mock).mockResolvedValue(matches);

    const res = await request(app).get('/matches');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(matches);
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

describe('MatchController - createNewMatch', () => {
  it('deve criar uma nova partida com sucesso', async () => {
    const newMatch = { name: 'Nova Partida' };
    const createdMatch = { id: '1', ...newMatch, state: 'WAITING' };

    (MatchRepository.findMatchByName as jest.Mock).mockResolvedValue(null);
    (MatchRepository.createMatch as jest.Mock).mockResolvedValue(createdMatch);

    const res = await request(app).post('/matches').send(newMatch);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: '1',
      name: 'Nova Partida',
      state: 'WAITING',
    });
  });

  it('deve retornar erro 400 se nome estiver ausente', async () => {
    const res = await request(app).post('/matches').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'ValidationError',
      message: 'O nome da partida é obrigatório.',
    });
  });

  it('deve retornar erro 409 se partida já existir', async () => {
    (MatchRepository.findMatchByName as jest.Mock).mockResolvedValue({ id: '1', name: 'Existente' });

    const res = await request(app).post('/matches').send({ name: 'Existente' });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Já existe uma partida com esse nome.',
    });
  });
});

describe('MatchController - getOpenMatches', () => {
  it('deve retornar partidas abertas com sucesso', async () => {
    const openMatches = [
      { id: '1', name: 'Match A', state: 'WAITING' },
      { id: '2', name: 'Match B', state: 'WAITING' },
    ];

    (MatchRepository.findOpenMatches as jest.Mock).mockResolvedValue(openMatches);

    const res = await request(app).get('/matches/open');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { id: '1', name: 'Match A', state: 'WAITING' },
      { id: '2', name: 'Match B', state: 'WAITING' },
    ]);
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

describe('MatchController - getPlayerHistory', () => {
  it('deve retornar o histórico do jogador', async () => {
    const history = [
      { matchName: 'Partida 1', score: 100 },
      { matchName: 'Partida 2', score: 80 },
    ];

    (MatchService.getPlayerHistory as jest.Mock).mockResolvedValue(history);

    const res = await request(app).get('/matches/history/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(history);
  });

  it('deve retornar erro 400 se o ID do jogador estiver ausente', async () => {
    const res = await request(app).get('/matches/history/');

    expect(res.statusCode).toBe(404);
  });

  it('deve retornar erro 404 se não houver histórico', async () => {
    (MatchService.getPlayerHistory as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/matches/history/1');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Nenhum histórico encontrado para este jogador.',
    });
  });
});

describe('MatchController - addPlayerToMatch', () => {
  it('deve adicionar jogador à partida', async () => {
    const match = { id: '1', name: 'Partida A', state: 'WAITING' };

    (MatchService.joinMatch as jest.Mock).mockResolvedValue(match);

    const res = await request(app).post('/matches/1/player/2');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(match);
  });

  it('deve retornar erro 400 se matchId ou playerId forem ausentes', async () => {
    const res = await request(app).post('/matches//player/');

    expect(res.statusCode).toBe(404);
  });
});

describe('MatchController - removePlayerFromMatch', () => {
  it('deve remover jogador da partida', async () => {
    const match = { id: '1', name: 'Partida A', state: 'WAITING' };

    (MatchService.leaveMatch as jest.Mock).mockResolvedValue(match);

    const res = await request(app).delete('/matches/1/player/2');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(match);
  });

  it('deve retornar erro 400 se matchId ou playerId forem ausentes', async () => {
    const res = await request(app).delete('/matches//player/');

    expect(res.statusCode).toBe(404);
  });
});

describe('MatchController - startMatchById', () => {
  it('deve iniciar a partida pelo ID', async () => {
    const match = { id: '1', name: 'Partida A', state: 'IN_PROGRESS' };

    (MatchService.startMatch as jest.Mock).mockResolvedValue(match);

    const res = await request(app).post('/matches/1/start');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(match);
  });

  it('deve retornar erro 400 se matchId for ausente', async () => {
    const res = await request(app).post('/matches//start');

    expect(res.statusCode).toBe(404);
  });
});

describe('MatchController - finishMatchById', () => {
  it('deve finalizar a partida com scores válidos', async () => {
    const match = {
      id: '1',
      name: 'Final Match',
      state: 'FINISHED',
      scores: { '1': 50, '2': 100 },
    };

    (MatchService.finishMatch as jest.Mock).mockResolvedValue(match);

    const res = await request(app)
      .post('/matches/1/finish')
      .send({ scores: { '1': 50, '2': 100 } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(match);
  });

  it('deve retornar erro 400 se matchId for ausente', async () => {
    const res = await request(app)
      .post('/matches//finish')
      .send({ scores: { '1': 100 } });

    expect(res.statusCode).toBe(404);
  });

  it('deve retornar erro 400 se scores forem inválidos', async () => {
    const res = await request(app)
      .post('/matches/1/finish')
      .send({ scores: null });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'ValidationError',
      message: 'Scores devem estar no formato { "playerId": pontuacao }.'
    });
  });
});
