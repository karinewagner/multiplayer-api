import { MatchRepository } from '../repositories/match.repository';
import { PlayerRepository } from '../repositories/player.repository';

import { Match } from "@prisma/client";
import { MatchState } from "@prisma/client";

export const MatchService = {
  joinMatch: async (matchId: string, playerId: string): Promise<Match | null> => {
    const match = await MatchRepository.findById(matchId);
    const player = await PlayerRepository.findById(playerId);

    if (!match || !player) return null;
    if (player.matchId) throw new Error('Player already in a match');
    if (match.state !== MatchState.WAITING) throw new Error('Match not available');
    if (match.players.length >= 4) throw new Error('Match is full');

    // Atualiza o banco para associar player e partida
    await PlayerRepository.update(playerId, { matchId });
    await MatchRepository.addPlayer(matchId, playerId); // método para atualizar lista

    // Recarrega o match atualizado
    return await MatchRepository.findById(matchId);
  },

  leaveMatch: async (matchId: string, playerId: string): Promise<Match | null> => {
    const match = await MatchRepository.findById(matchId);
    const player = await PlayerRepository.findById(playerId);

    if (!match || !player) return null;

    await PlayerRepository.update(playerId, { matchId: null });
    await MatchRepository.removePlayer(matchId, playerId); // método para remover jogador da lista

    return await MatchRepository.findById(matchId);
  },

  startMatch: async (matchId: string): Promise<Match | null> => {
    const match = await MatchRepository.findById(matchId);
    if (!match) return null;
    if (match.players.length === 0) throw new Error('No players in match');

    await MatchRepository.update(matchId, {
      state: 'in_progress',
      startDate: new Date(),
    });

    return await MatchRepository.findById(matchId);
  },

  finishMatch: async (
    matchId: string,
    scores: { [playerId: string]: number }
  ): Promise<Match | null> => {
    const match = await MatchRepository.findById(matchId);
    if (!match) return null;

    // Atualiza estado e scores
    await MatchRepository.update(matchId, {
      state: 'finished',
      scores,
      players: [],
    });

    // Limpa matchId dos jogadores
    for (const player of match.players) {
      await PlayerRepository.update(player.id, { matchId: null });
    }

    return await MatchRepository.findById(matchId);
  },

  getPlayerHistory: async (playerId: string): Promise<Match[]> => {
    const allMatches = await MatchRepository.findAll();
    return allMatches.filter((m) =>
      m.state === MatchState.FINISHED &&
      m.scores &&
      typeof m.scores === 'object' &&
      !Array.isArray(m.scores) &&
      playerId in m.scores
    );
  },
};
