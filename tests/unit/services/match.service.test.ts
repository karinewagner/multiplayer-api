import { MatchService } from '../../../src/services/match.service';
import { MatchRepository } from '../../../src/repositories/match.repository';
import { PlayerRepository } from '../../../src/repositories/player.repository';
import { Match, MatchState, Player } from '@prisma/client';

jest.mock('../../../src/repositories/match.repository');
jest.mock('../../../src/repositories/player.repository');

type MatchWithPlayers = Match & { players: Player[] };

const matchId = 'match-123';
const playerId = 'player-1';

const mockPlayer: Player = {
  id: playerId,
  name: 'Jogador',
  nickname: 'nick',
  email: 'jogador@email.com',
  matchId: null,
};

const baseMatch: MatchWithPlayers = {
  id: matchId,
  name: 'Partida Teste',
  state: MatchState.WAITING,
  startDate: null,
  scores: null,
  players: [],
};

beforeEach(() => jest.clearAllMocks());

describe('MatchService.startMatch', () => {
  it('deve lançar erro se a partida já está em andamento', async () => {
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue({
      ...baseMatch,
      state: MatchState.IN_PROGRESS,
    });

    await expect(MatchService.startMatch(matchId)).rejects.toThrow('A partida já está em andamento.');
  });

  it('deve lançar erro se a partida já foi finalizada', async () => {
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue({
      ...baseMatch,
      state: MatchState.FINISHED,
    });

    await expect(MatchService.startMatch(matchId)).rejects.toThrow('A partida já foi finalizada e não pode ser iniciada novamente.');
  });

  it('deve lançar erro se não houver jogadores', async () => {
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue({
      ...baseMatch,
      players: [],
    });

    await expect(MatchService.startMatch(matchId)).rejects.toThrow('Não é possível iniciar uma partida sem jogadores.');
  });

  it('deve iniciar a partida corretamente', async () => {
    const players = [mockPlayer];

    (MatchRepository.findMatchById as jest.Mock)
      .mockResolvedValueOnce({ ...baseMatch, players })
      .mockResolvedValueOnce({ ...baseMatch, players, state: MatchState.IN_PROGRESS });

    (MatchRepository.updateMatchById as jest.Mock).mockResolvedValue(undefined);

    const result = await MatchService.startMatch(matchId);

    expect(MatchRepository.updateMatchById).toHaveBeenCalledWith(matchId, expect.objectContaining({
      state: MatchState.IN_PROGRESS,
      startDate: expect.any(Date),
    }));

    expect(result?.state).toBe(MatchState.IN_PROGRESS);
  });
});

describe('MatchService.joinMatch', () => {
  it('deve lançar erro se a partida não for encontrada', async () => {
    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(mockPlayer);
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue(null);

    await expect(MatchService.joinMatch(matchId, playerId))
      .rejects.toThrow('Partida não encontrada.');
  });

  it('deve lançar erro se o jogador já estiver em uma partida', async () => {
    const joinedPlayer = { ...mockPlayer, matchId: 'outra' };

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(joinedPlayer);
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue(baseMatch);

    await expect(MatchService.joinMatch(matchId, playerId))
      .rejects.toThrow('Jogador já está em uma partida.');
  });

  it('deve lançar erro se a partida estiver cheia', async () => {
    const matchFull = { ...baseMatch, players: Array(4).fill(mockPlayer) };

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(mockPlayer);
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue(matchFull);

    await expect(MatchService.joinMatch(matchId, playerId))
      .rejects.toThrow('A partida já está cheia (máximo de 4 jogadores).');
  });

  it('deve permitir entrada na partida', async () => {
    const players = [mockPlayer];

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(mockPlayer);
    (MatchRepository.findMatchById as jest.Mock)
      .mockResolvedValueOnce({ ...baseMatch, players })
      .mockResolvedValueOnce({ ...baseMatch, players: [...players, mockPlayer] });

    (PlayerRepository.updatePlayerById as jest.Mock).mockResolvedValue(undefined);

    const result = await MatchService.joinMatch(matchId, playerId);

    expect(PlayerRepository.updatePlayerById).toHaveBeenCalledWith(playerId, { matchId });
    expect((result as MatchWithPlayers).players.length).toBeGreaterThan(0);
  });
});

describe('MatchService.leaveMatch', () => {
  it('deve lançar erro se o jogador não estiver na partida', async () => {
    const player = { ...mockPlayer, matchId: 'outra' };

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(player);
    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue(baseMatch);

    await expect(MatchService.leaveMatch(matchId, playerId))
      .rejects.toThrow('O jogador não está participando desta partida.');
  });

  it('deve permitir o jogador sair da partida', async () => {
    const player = { ...mockPlayer, matchId };
    const matchWithPlayer = { ...baseMatch, players: [player] };

    (PlayerRepository.findPlayerById as jest.Mock).mockResolvedValue(player);
    (MatchRepository.findMatchById as jest.Mock)
      .mockResolvedValueOnce(matchWithPlayer)
      .mockResolvedValueOnce({ ...baseMatch, players: [] });

    (PlayerRepository.updatePlayerById as jest.Mock).mockResolvedValue(undefined);
    (MatchRepository.removePlayerFromMatch as jest.Mock).mockResolvedValue(undefined);

    const result = await MatchService.leaveMatch(matchId, playerId);

    expect(PlayerRepository.updatePlayerById).toHaveBeenCalledWith(playerId, { matchId: null });
    expect(MatchRepository.removePlayerFromMatch).toHaveBeenCalledWith(matchId, playerId);
    expect((result as MatchWithPlayers).players).toEqual([]);
  });
});

describe('MatchService.finishMatch', () => {
  it('deve lançar erro se scores estiverem faltando', async () => {
    const match = { ...baseMatch, state: MatchState.IN_PROGRESS, players: [mockPlayer] };

    (MatchRepository.findMatchById as jest.Mock).mockResolvedValue(match);

    await expect(MatchService.finishMatch(matchId, {})).rejects
      .toThrow(`Faltam pontuações para o(s) jogadore(s): ${mockPlayer.id}`);
  });

  it('deve finalizar partida com sucesso', async () => {
    const scores = { [playerId]: 10 };
    const match = { ...baseMatch, state: MatchState.IN_PROGRESS, players: [mockPlayer] };

    (MatchRepository.findMatchById as jest.Mock)
      .mockResolvedValueOnce(match)
      .mockResolvedValueOnce({ ...match, state: MatchState.FINISHED });

    (MatchRepository.updateMatchById as jest.Mock).mockResolvedValue(undefined);
    (PlayerRepository.updatePlayerById as jest.Mock).mockResolvedValue(undefined);

    const result = await MatchService.finishMatch(matchId, scores);

    expect(MatchRepository.updateMatchById).toHaveBeenCalledWith(matchId, expect.objectContaining({
      state: MatchState.FINISHED,
      scores,
      players: {
        disconnect: match.players.map(p => ({ id: p.id })),
      },
    }));

    expect(PlayerRepository.updatePlayerById).toHaveBeenCalledWith(playerId, { matchId: null });
    expect(result?.state).toBe(MatchState.FINISHED);
  });
});

describe('MatchService.getPlayerHistory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deve retornar partidas finalizadas com scores contendo o jogador', async () => {
    const playerId = 'player-1';

    const matchesMock: MatchWithPlayers[] = [
      {
        ...baseMatch,
        id: 'm1',
        state: MatchState.FINISHED,
        scores: { [playerId]: 10 },
        players: [],
      },
      {
        ...baseMatch,
        id: 'm2',
        state: MatchState.IN_PROGRESS,
        scores: { [playerId]: 5 },
        players: [],
      },
      {
        ...baseMatch,
        id: 'm3',
        state: MatchState.FINISHED,
        scores: null,
        players: [],
      },
      {
        ...baseMatch,
        id: 'm4',
        state: MatchState.FINISHED,
        scores: { 'outro-jogador': 15 },
        players: [],
      },
    ];

    (MatchRepository.findAllMatches as jest.Mock).mockResolvedValue(matchesMock);

    const result = await MatchService.getPlayerHistory(playerId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m1');
  });

  it('deve retornar array vazio se não houver histórico para o jogador', async () => {
    const matchesMock: MatchWithPlayers[] = [
      {
        ...baseMatch,
        id: 'm1',
        state: MatchState.FINISHED,
        scores: { 'outro': 99 },
        players: [],
      },
    ];

    (MatchRepository.findAllMatches as jest.Mock).mockResolvedValue(matchesMock);

    const result = await MatchService.getPlayerHistory('player-inexistente');

    expect(result).toEqual([]);
  });
});
