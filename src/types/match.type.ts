import { Match, Player } from '@prisma/client';

export type MatchWithPlayers = Match & {
  players: Player[];
};