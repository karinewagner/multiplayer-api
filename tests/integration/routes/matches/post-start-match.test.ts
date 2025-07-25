import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { MatchController } from '../../../../src/controllers/match.controller';
import { MatchService } from '../../../../src/services/match.service';
import { DomainError } from '../../../../src/errors/domain.error';
import { NotFoundError } from '../../../../src/errors/not-found.error';
import { ConflictError } from '../../../../src/errors/conflict.error';
import { ValidationError } from '../../../../src/errors/validation.error';

jest.mock('../../../../src/services/match.service');

const app = express();
app.use(express.json());

app.post('/matches/:matchId/start', MatchController.startMatchById);

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

describe('POST /matches/:matchId/start - Integração (mock)', () => {
  it('deve iniciar a partida com sucesso', async () => {
    const mockMatch = {
      id: 'match-id',
      name: 'Partida Iniciada',
      state: 'IN_PROGRESS',
      players: [],
    };

    (MatchService.startMatch as jest.Mock).mockResolvedValue(mockMatch);

    const res = await request(app).post('/matches/match-id/start');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('state', 'IN_PROGRESS');
  });

  it('deve retornar 400 se matchId for inválido', async () => {
    const res = await request(app).post('/matches//start');

    expect(res.statusCode).toBe(404);
  });

  it('deve retornar 404 se a partida não for encontrada', async () => {
    (MatchService.startMatch as jest.Mock).mockRejectedValue(
      new NotFoundError('Partida não encontrada.')
    );

    const res = await request(app).post('/matches/invalid-id/start');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Partida não encontrada.');
  });

  it('deve retornar 400 se não houver jogadores na partida', async () => {
    (MatchService.startMatch as jest.Mock).mockRejectedValue(
      new ValidationError('Não é possível iniciar uma partida sem jogadores.')
    );

    const res = await request(app).post('/matches/sem-jogadores/start');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Não é possível iniciar uma partida sem jogadores.');
  });

  it('deve retornar 409 se a partida já estiver em andamento', async () => {
    (MatchService.startMatch as jest.Mock).mockRejectedValue(
      new ConflictError('A partida já está em andamento.')
    );

    const res = await request(app).post('/matches/em-andamento/start');

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('A partida já está em andamento.');
  });

  it('deve retornar 409 se a partida já estiver finalizada', async () => {
    (MatchService.startMatch as jest.Mock).mockRejectedValue(
      new ConflictError('A partida já foi finalizada e não pode ser iniciada novamente.')
    );

    const res = await request(app).post('/matches/finalizada/start');

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('A partida já foi finalizada e não pode ser iniciada novamente.');
  });
});
