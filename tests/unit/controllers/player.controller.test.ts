import request from 'supertest';
import express, { Application } from 'express';
import { PlayerController } from '../../../src/controllers/player.controller';
import { PlayerRepository } from '../../../src/repositories/player.repository';
import { DomainError } from '../../../src/errors/domain.error';

jest.mock('../../../src/repositories/player.repository');

const app: Application = express();
app.use(express.json());

app.get('/players', PlayerController.getPlayersList);
app.post('/players', PlayerController.createPlayer);
app.get('/players/:id', PlayerController.getPlayerById);
app.put('/players/:id', PlayerController.updatePlayerById);
app.delete('/players/:id', PlayerController.deletePlayerById);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Erro interno no servidor.',
  });
});

describe('PlayerController - getPlayersList', () => {
  it('deve retornar uma lista de jogadores', async () => {
    const mockPlayers = [{ id: '1', name: 'John', nickname: 'johnny', email: 'john@example.com' }];
    (PlayerRepository.findAllPlayers as jest.Mock).mockResolvedValue(mockPlayers);

    const res = await request(app).get('/players');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockPlayers);
  });

  it('deve lançar erro 404 se não houver jogadores', async () => {
    (PlayerRepository.findAllPlayers as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/players');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Nenhum jogador encontrado',
    });
  });
});

describe('PlayerController - createPlayer', () => {
  it('deve criar um jogador com sucesso', async () => {
    const newPlayer = {
      name: 'John',
      nickname: 'johnny',
      email: 'john@example.com',
    };

    const createdPlayer = {
      id: '1',
      ...newPlayer,
    };

    (PlayerRepository.createPlayer as jest.Mock).mockResolvedValue(createdPlayer);

    const res = await request(app).post('/players').send(newPlayer);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      name: 'John',
      nickname: 'johnny',
      email: 'john@example.com',
    });
  });

  it('deve retornar erro 409 se o email já estiver em uso', async () => {
    const newPlayer = {
      name: 'Ana',
      nickname: 'aninha',
      email: 'ana@email.com',
    };

    (PlayerRepository.createPlayer as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: {
        target: ['email'],
      },
    });

    const res = await request(app).post('/players').send(newPlayer);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Este e-mail já está em uso.',
    });
  });

  it('deve retornar erro 409 se o nickname já estiver em uso', async () => {
    const newPlayer = {
      name: 'Lucas',
      nickname: 'lucas123',
      email: 'lucas@email.com',
    };

    (PlayerRepository.createPlayer as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: {
        target: ['nickname'],
      },
    });

    const res = await request(app).post('/players').send(newPlayer);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Este nickname já está em uso.',
    });
  });

  it('deve retornar erro 409 com mensagem genérica se o campo for desconhecido', async () => {
    const newPlayer = {
      name: 'Carlos',
      nickname: 'carluxo',
      email: 'carlos@email.com',
    };

    (PlayerRepository.createPlayer as jest.Mock).mockRejectedValue({
      code: 'P2002',
      meta: {
        target: ['algumCampoInesperado'],
      },
    });

    const res = await request(app).post('/players').send(newPlayer);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: 'ConflictError',
      message: 'Campo duplicado.',
    });
  });
});

describe('PlayerController - getPlayerById', () => {
  it('deve retornar os dados do jogador pelo ID', async () => {
    const mockPlayer = {
      id: '1',
      name: 'Maria',
      nickname: 'mari',
      email: 'maria@example.com',
    };

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(mockPlayer);

    const res = await request(app).get('/players/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      name: 'Maria',
      nickname: 'mari',
      email: 'maria@example.com',
    });
  });

  it('deve retornar erro 404 se jogador não existir', async () => {
    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/players/1');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'NotFoundError',
      message: 'Jogador não localizado',
    });
  });
});

describe('PlayerController - updatePlayerById', () => {
  it('deve atualizar os dados do jogador', async () => {
    const updatedPlayer = {
      id: '1',
      name: 'Maria Eduarda',
      nickname: 'mari_edu',
      email: 'mari@email.com',
    };

    (PlayerRepository.updatePlayerById as jest.Mock).mockResolvedValue(updatedPlayer);

    const res = await request(app)
      .put('/players/1')
      .send({ name: 'Maria Eduarda', nickname: 'mari_edu' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Dados atualizados com sucesso!',
      updatePlayer: {
        name: 'Maria Eduarda',
        nickname: 'mari_edu',
        email: 'mari@email.com',
      },
    });
  });

  it('deve retornar erro 400 se o ID não for fornecido', async () => {
    const res = await request(app).put('/players/').send({});

    expect(res.statusCode).toBe(404);
  });
});

describe('PlayerController - deletePlayerById', () => {
  it('deve deletar um jogador pelo ID', async () => {
    (PlayerRepository.deletePlayerById as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete('/players/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Jogador excluído com sucesso!',
    });
  });

  it('deve retornar erro 400 se o ID não for fornecido', async () => {
    const res = await request(app).delete('/players/');

    expect(res.statusCode).toBe(404);
  });
});
