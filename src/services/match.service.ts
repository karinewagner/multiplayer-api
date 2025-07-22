import { MatchRepository } from '../repositories/match.repository';
import { PlayerRepository } from '../repositories/player.repository';

import { Match } from "@prisma/client";
import { MatchState } from "@prisma/client";

export const MatchService = {
  joinMatch: async (matchId: string, playerId: string): Promise<Match | null> => {
    const player = await PlayerRepository.findPlayerById(playerId);
    const match = await MatchRepository.findMatchById(matchId);

    if (!match) throw new Error('Partida não encontrada.');
    if (!player) throw new Error('Jogador não encontrado.');

    if (player.matchId) throw new Error('Jogador já está em uma partida.');
    if (match.state !== MatchState.WAITING) throw new Error('A partida não está disponível para entrar.');
    if (match.players.length >= 4) throw new Error('A partida já está cheia (máximo de 4 jogadores).');

    // Associa o jogador à partida
    await PlayerRepository.updatePlayerById(playerId, { matchId });

    // Retorna a partida atualizada
    return await MatchRepository.findMatchById(matchId);
  },

  leaveMatch: async (matchId: string, playerId: string): Promise<Match | null> => {
    const player = await PlayerRepository.findPlayerById(playerId);
    const match = await MatchRepository.findMatchById(matchId);

    if (!match) throw new Error('Partida não encontrada.');
    if (!player) throw new Error('Jogador não encontrado.');

    if (player.matchId !== matchId) {
      throw new Error('O jogador não está participando desta partida.');
    }

    // Remove o jogador da partida
    await PlayerRepository.updatePlayerById(playerId, { matchId: null });
    await MatchRepository.removePlayerFromMatch(matchId, playerId);

    // Retorna a partida atualizada
    return await MatchRepository.findMatchById(matchId);
  },

  startMatch: async (matchId: string): Promise<Match | null> => {
    const match = await MatchRepository.findMatchById(matchId);
    
    if (!match) return null;

    if (match.state === 'IN_PROGRESS') {
      throw new Error('A partida já está em andamento.');
    }

    if (match.state === 'FINISHED') {
      throw new Error('A partida já foi finalizada e não pode ser iniciada novamente.');
    }

    if (match.players.length === 0) {
      throw new Error('Não é possível iniciar uma partida sem jogadores.');
    }

    await MatchRepository.updateMatchById(matchId, {
      state: 'IN_PROGRESS',
      startDate: new Date(),
    });

    return await MatchRepository.findMatchById(matchId);
  },

  finishMatch: async (
    matchId: string,
    scores: { [playerId: string]: number }
  ): Promise<Match | null> => {
    const match = await MatchRepository.findMatchById(matchId);

    if (!match) return null;

    if (match.state === 'WAITING') {
      throw new Error('A partida não foi inicializada.');
    }

    if (match.state === 'FINISHED') {
      throw new Error('A partida já foi finalizada.');
    }

    const playerIds = match.players.map(player => player.id);

    // 1. Verifica se todos os IDs do body pertencem à partida
    const invalidIds = Object.keys(scores).filter(
      playerId => !playerIds.includes(playerId)
    );
    if (invalidIds.length > 0) {
      throw new Error(
        `O(s) seguinte(s) jogador(es) não pertence(m) à partida: ${invalidIds.join(', ')}`
      );
    }

    // 2. Verifica se todos os jogadores da partida estão no scores
    const missingPlayers = playerIds.filter(playerId => !(playerId in scores));
    if (missingPlayers.length > 0) {
      throw new Error(
        `Faltam pontuações para o(s) jogadore(s): ${missingPlayers.join(', ')}`
      );
    }

    // 3. Atualiza estado e scores, desconectando os players
    await MatchRepository.updateMatchById(matchId, {
      state: 'FINISHED',
      scores,
      players: {
        disconnect: match.players.map(player => ({ id: player.id }))
      }
    });

    // 4. Limpa matchId dos jogadores
    for (const player of match.players) {
      await PlayerRepository.updatePlayerById(player.id, { matchId: null });
    }

    return await MatchRepository.findMatchById(matchId);
  },

  getPlayerHistory: async (playerId: string): Promise<Match[]> => {
    const allMatches = await MatchRepository.findAllMatches();
    return allMatches.filter((m) =>
      m.state === MatchState.FINISHED &&
      m.scores &&
      typeof m.scores === 'object' &&
      !Array.isArray(m.scores) &&
      playerId in m.scores
    );
  },
};
