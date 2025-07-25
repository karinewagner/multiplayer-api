import { PlayerRepository } from '../../../src/repositories/player.repository';
import { prisma } from '../../../src/database/prisma';
import { NotFoundError } from '../../../src/errors/not-found.error';
import { ValidationError } from '../../../src/errors/validation.error';

jest.mock('../../../src/database/prisma', () => ({
  prisma: {
    player: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const fakePlayer = {
  id: 'player-1',
  name: 'Test User',
  nickname: 'tester',
  email: 'test@email.com',
  matchId: null,
};

beforeEach(() => jest.clearAllMocks());

describe('PlayerRepository.findAllPlayers', () => {
  it('deve retornar todos os jogadores', async () => {
    (prisma.player.findMany as jest.Mock).mockResolvedValue([fakePlayer]);

    const result = await PlayerRepository.findAllPlayers();
    expect(result).toEqual([fakePlayer]);
  });
});

describe('PlayerRepository.createPlayer', () => {
  it('deve criar um jogador', async () => {
    const input = {
      name: fakePlayer.name,
      nickname: fakePlayer.nickname,
      email: fakePlayer.email,
      matchId: null,
    };

    (prisma.player.create as jest.Mock).mockResolvedValue(fakePlayer);

    const result = await PlayerRepository.createPlayer(input);
    expect(result).toEqual(fakePlayer);
    expect(prisma.player.create).toHaveBeenCalledWith({ data: input });
  });
});

describe('PlayerRepository.findPlayerById', () => {
  it('deve retornar um jogador pelo ID', async () => {
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(fakePlayer);

    const result = await PlayerRepository.findPlayerById('player-1');
    expect(result).toEqual(fakePlayer);
  });
});

describe('PlayerRepository.updatePlayerById', () => {
  it('deve lançar erro ao atualizar jogador inexistente', async () => {
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      PlayerRepository.updatePlayerById('invalid-id', {})
    ).rejects.toThrow(NotFoundError);
  });

  it('deve lançar erro ao tentar atualizar jogador que está em partida', async () => {
    const playerWithMatch = { ...fakePlayer, matchId: 'match-1' };
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(playerWithMatch);

    await expect(
      PlayerRepository.updatePlayerById('player-1', { name: 'Novo Nome' })
    ).rejects.toThrow(ValidationError);
  });

  it('deve permitir atualizar jogador ao sair da partida', async () => {
    const playerWithMatch = { ...fakePlayer, matchId: 'match-1' };
    const updatedPlayer = { ...fakePlayer, matchId: null };

    (prisma.player.findUnique as jest.Mock).mockResolvedValue(playerWithMatch);
    (prisma.player.update as jest.Mock).mockResolvedValue(updatedPlayer);

    const result = await PlayerRepository.updatePlayerById('player-1', { matchId: null });
    expect(result).toEqual(updatedPlayer);
  });
});

describe('PlayerRepository.deletePlayerById', () => {
  it('deve lançar erro ao deletar jogador inexistente', async () => {
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      PlayerRepository.deletePlayerById('invalid-id')
    ).rejects.toThrow(NotFoundError);
  });

  it('deve lançar erro ao deletar jogador em partida', async () => {
    const playerWithMatch = { ...fakePlayer, matchId: 'match-1' };
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(playerWithMatch);

    await expect(
      PlayerRepository.deletePlayerById('player-1')
    ).rejects.toThrow(ValidationError);
  });

  it('deve deletar jogador com sucesso', async () => {
    (prisma.player.findUnique as jest.Mock).mockResolvedValue(fakePlayer);
    (prisma.player.delete as jest.Mock).mockResolvedValue(undefined);

    await expect(
      PlayerRepository.deletePlayerById('player-1')
    ).resolves.toBeUndefined();

    expect(prisma.player.delete).toHaveBeenCalledWith({
      where: { id: 'player-1' },
    });
  });
});

