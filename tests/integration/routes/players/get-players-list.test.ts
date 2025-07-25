import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import playerRoutes from '../../../../src/routes/player.routes';
import { PlayerRepository } from '../../../../src/repositories/player.repository';
import { NotFoundError } from '../../../../src/errors/not-found.error';

jest.mock('../../../../src/repositories/player.repository');

const app = express();
app.use(express.json());
app.use('/players', playerRoutes);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.name, message: err.message });
  }

  return res.status(500).json({ error: 'Erro interno no servidor' });
});

describe('GET /players - Integração com mock', () => {
  it('deve retornar a lista de jogadores com status 200', async () => {
    (PlayerRepository.findAllPlayers as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Carlos', nickname: 'carlao', email: 'carlos@email.com', matchId: null },
      { id: '2', name: 'Ana', nickname: 'aninha', email: 'ana@email.com', matchId: null }
    ]);

    const res = await request(app).get('/players');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('nickname', 'carlao');
  });

  it('deve retornar erro 404 se não houver jogadores', async () => {
    (PlayerRepository.findAllPlayers as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/players');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Nenhum jogador encontrado',
    });
  });
});
