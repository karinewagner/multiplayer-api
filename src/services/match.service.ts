import { ConflictError } from '../errors/conflict.error';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { MatchRepository } from '../repositories/match.repository';
import { PlayerRepository } from '../repositories/player.repository';

import { MatchState } from '@prisma/client';
import { MatchWithPlayers } from '../types/match.type';


type Scores = { [playerId: string]: number };

export const MatchService = {
  async joinMatch(matchId: string, playerId: string): Promise<MatchWithPlayers> {
    const [player, match] = await Promise.all([
      PlayerRepository.findPlayerById(playerId),
      MatchRepository.findMatchById(matchId),
    ]);

    if (!match) throw new NotFoundError('Partida não encontrada.');
    if (!player) throw new NotFoundError('Jogador não encontrado.');
    if (player.matchId) throw new ConflictError('Jogador já está em uma partida.');
    if (match.state !== MatchState.WAITING) throw new ConflictError('A partida não está disponível para entrar.');
    if (match.players.length >= 4) throw new ConflictError('A partida já está cheia (máximo de 4 jogadores).');

    await PlayerRepository.updatePlayerById(playerId, { matchId });

    return await MatchRepository.findMatchById(matchId) as MatchWithPlayers;
  },

  async leaveMatch(matchId: string, playerId: string): Promise<MatchWithPlayers> {
    const [player, match] = await Promise.all([
      PlayerRepository.findPlayerById(playerId),
      MatchRepository.findMatchById(matchId),
    ]);

    if (!match) throw new NotFoundError('Partida não encontrada.');
    if (!player) throw new NotFoundError('Jogador não encontrado.');
    if (player.matchId !== matchId) throw new ConflictError('O jogador não está participando desta partida.');

    await Promise.all([
      PlayerRepository.updatePlayerById(playerId, { matchId: null }),
      MatchRepository.removePlayerFromMatch(matchId, playerId),
    ]);

    return await MatchRepository.findMatchById(matchId) as MatchWithPlayers;
  },

  async startMatch(matchId: string): Promise<MatchWithPlayers> {
    const match = await MatchRepository.findMatchById(matchId) as MatchWithPlayers;
    if (!match) throw new NotFoundError('Partida não encontrada.');

    switch (match.state) {
      case MatchState.IN_PROGRESS:
        throw new ConflictError('A partida já está em andamento.');
      case MatchState.FINISHED:
        throw new ConflictError('A partida já foi finalizada e não pode ser iniciada novamente.');
    }

    if (match.players.length === 0) {
      throw new ValidationError('Não é possível iniciar uma partida sem jogadores.');
    }

    await MatchRepository.updateMatchById(matchId, {
      state: MatchState.IN_PROGRESS,
      startDate: new Date(),
    });

    return await MatchRepository.findMatchById(matchId) as MatchWithPlayers;
  },

  async finishMatch(matchId: string, scores: Scores): Promise<MatchWithPlayers> {
    const match = await MatchRepository.findMatchById(matchId) as MatchWithPlayers;
    if (!match) throw new NotFoundError('Partida não encontrada.');

    if (match.state === MatchState.WAITING) {
      throw new ConflictError('A partida não foi inicializada.');
    }

    if (match.state === MatchState.FINISHED) {
      throw new ConflictError('A partida já foi finalizada.');
    }

    const playerIds = match.players.map(p => p.id);

    const invalidIds = Object.keys(scores).filter(id => !playerIds.includes(id));
    if (invalidIds.length > 0) {
      throw new ValidationError(`O(s) seguinte(s) jogador(es) não pertence(m) à partida: ${invalidIds.join(', ')}`);
    }

    const missingIds = playerIds.filter(id => !(id in scores));
    if (missingIds.length > 0) {
      throw new ValidationError(`Faltam pontuações para o(s) jogadore(s): ${missingIds.join(', ')}`);
    }

    await MatchRepository.updateMatchById(matchId, {
      state: MatchState.FINISHED,
      scores,
      players: {
        disconnect: match.players.map(player => ({ id: player.id })),
      },
    });

    await Promise.all(
      match.players.map(player =>
        PlayerRepository.updatePlayerById(player.id, { matchId: null })
      )
    );

    return await MatchRepository.findMatchById(matchId) as MatchWithPlayers;
  },

  async getPlayerHistory(playerId: string): Promise<MatchWithPlayers[]> {
    const allMatches = await MatchRepository.findAllMatches() as MatchWithPlayers[];

    return allMatches.filter(
      m =>
        m.state === MatchState.FINISHED &&
        m.scores &&
        typeof m.scores === 'object' &&
        !Array.isArray(m.scores) &&
        playerId in m.scores
    );
  },
};
