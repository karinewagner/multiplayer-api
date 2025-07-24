import { MatchRepository } from '../../../src/repositories/match.repository';
import { MatchState } from '@prisma/client';
import { prisma } from '../../../src/database/prisma';

jest.mock('../../../src/database/prisma', () => ({
  prisma: {
    match: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockMatch = {
  id: 'match-id',
  name: 'Partida Teste',
  state: MatchState.WAITING,
  startDate: null,
  scores: null,
  players: [],
};

beforeEach(() => jest.clearAllMocks());

describe('MatchRepository.findAllMatches', () => {
it('deve retornar todas as partidas com jogadores', async () => {
    (prisma.match.findMany as jest.Mock).mockResolvedValue([mockMatch]);

    const result = await MatchRepository.findAllMatches();

    expect(result).toEqual([mockMatch]);
    expect(prisma.match.findMany).toHaveBeenCalledWith({
    include: { players: true },
    });
});
});

describe('MatchRepository.findMatchById', () => {
it('deve retornar partida por ID com jogadores', async () => {
    (prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.findMatchById('match-id');

    expect(result).toEqual(mockMatch);
    expect(prisma.match.findUnique).toHaveBeenCalledWith({
    where: { id: 'match-id' },
    include: { players: true },
    });
});
});

describe('MatchRepository.findOpenMatches', () => {
it('deve retornar partidas com estado WAITING', async () => {
    (prisma.match.findMany as jest.Mock).mockResolvedValue([mockMatch]);

    const result = await MatchRepository.findOpenMatches();

    expect(result).toEqual([mockMatch]);
    expect(prisma.match.findMany).toHaveBeenCalledWith({
    where: { state: MatchState.WAITING },
    include: { players: true },
    });
});
});

describe('MatchRepository.findMatchByName', () => {
it('deve retornar partida pelo nome', async () => {
    (prisma.match.findUnique as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.findMatchByName('Partida Teste');

    expect(result).toEqual(mockMatch);
    expect(prisma.match.findUnique).toHaveBeenCalledWith({
    where: { name: 'Partida Teste' },
    });
});
});

describe('MatchRepository.createMatch', () => {
it('deve criar uma nova partida', async () => {
    (prisma.match.create as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.createMatch('Nova Partida');

    expect(result).toEqual(mockMatch);
    expect(prisma.match.create).toHaveBeenCalledWith({
    data: { name: 'Nova Partida' },
    });
});
});

describe('MatchRepository.updateMatchById', () => {
it('deve atualizar uma partida e incluir jogadores', async () => {
    (prisma.match.update as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.updateMatchById('match-id', { state: MatchState.FINISHED });

    expect(result).toEqual(mockMatch);
    expect(prisma.match.update).toHaveBeenCalledWith({
    where: { id: 'match-id' },
    data: { state: MatchState.FINISHED },
    include: { players: true },
    });
});
});

describe('MatchRepository.deleteMatchById', () => {
it('deve deletar uma partida pelo ID', async () => {
    (prisma.match.delete as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.deleteMatchById('match-id');

    expect(result).toEqual(mockMatch);
    expect(prisma.match.delete).toHaveBeenCalledWith({
    where: { id: 'match-id' },
    });
});
});

describe('MatchRepository.addPlayerToMatch', () => {
it('deve conectar jogador à partida', async () => {
    (prisma.match.update as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.addPlayerToMatch('match-id', 'player-id');

    expect(result).toEqual(mockMatch);
    expect(prisma.match.update).toHaveBeenCalledWith({
    where: { id: 'match-id' },
    data: {
        players: { connect: { id: 'player-id' } },
    },
    include: { players: true },
    });
});
});

describe('MatchRepository.removePlayerFromMatch', () => {
it('deve desconectar jogador da partida', async () => {
    (prisma.match.update as jest.Mock).mockResolvedValue(mockMatch);

    const result = await MatchRepository.removePlayerFromMatch('match-id', 'player-id');

    expect(result).toEqual(mockMatch);
    expect(prisma.match.update).toHaveBeenCalledWith({
    where: { id: 'match-id' },
    data: {
        players: { disconnect: { id: 'player-id' } },
    },
    include: { players: true },
    });
});
});
