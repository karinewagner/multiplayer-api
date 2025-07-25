import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchRepository } from '../../../../src/repositories/match.repository';
import { validateMatch } from '../../../../src/middlewares/validate-match.middleware';
import { DomainError } from '../../../../src/errors/domain.error';

jest.mock('../../../../src/repositories/match.repository');

const app = express();
app.use(express.json());

app.post('/matches', validateMatch, MatchController.createNewMatch);

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

describe('POST /matches - Integração (mock)', () => {
  it('deve criar uma partida com sucesso', async () => {
    const mockMatch = {
      id: 'match-id',
      name: 'Nova Partida',
      state: 'WAITING',
      startDate: null,
      scores: null,
      players: [],
    };

    (MatchRepository.findMatchByName as jest.Mock).mockResolvedValue(null);
    (MatchRepository.createMatch as jest.Mock).mockResolvedValue(mockMatch);

    const res = await request(app).post('/matches').send({ name: 'Nova Partida' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Nova Partida');
    expect(res.body).not.toHaveProperty('id');
  });

  it('deve retornar erro 400 se o nome da partida for inválido', async () => {
    const res = await request(app).post('/matches').send({ name: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: 'ValidationError',
      message: 'O nome da partida é obrigatório.',
    });
  });

  it('deve retornar erro 409 se a partida já existir', async () => {
    (MatchRepository.findMatchByName as jest.Mock).mockResolvedValue({ id: 'existente' });

    const res = await request(app).post('/matches').send({ name: 'Duplicada' });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Já existe uma partida com esse nome.',
    });
  });
});
