import { MatchState } from '@prisma/client';
import { prisma } from '../database/prisma';
import { MatchWithPlayers } from '../types/match.type';

export const MatchRepository = {
  findAllMatches: async (): Promise<MatchWithPlayers[]> => {
    return await prisma.match.findMany({ include: { players: true } });
  },

  findMatchById: async (id: string): Promise<MatchWithPlayers | null> => {
    return await prisma.match.findUnique({ where: { id }, include: { players: true } });
  },

  findOpenMatches: async (): Promise<MatchWithPlayers[]> => {
    return await prisma.match.findMany({
      where: { state: MatchState.WAITING },
      include: { players: true },
    });
  },

  findMatchByName: async (name: string) => {
    return await prisma.match.findUnique({ where: { name } });
  },

  createMatch: async (name: string) => {
    return await prisma.match.create({ data: { name } });
  },

  updateMatchById: async (id: string, data: any): Promise<MatchWithPlayers> => {
    return await prisma.match.update({
      where: { id },
      data,
      include: { players: true },
    });
  },

  deleteMatchById: async (id: string) => {
    return await prisma.match.delete({ where: { id } });
  },

  addPlayerToMatch: async (matchId: string, playerId: string): Promise<MatchWithPlayers> => {
    return await prisma.match.update({
      where: { id: matchId },
      data: {
        players: { connect: { id: playerId } },
      },
      include: { players: true },
    });
  },

  removePlayerFromMatch: async (matchId: string, playerId: string): Promise<MatchWithPlayers> => {
    return await prisma.match.update({
      where: { id: matchId },
      data: {
        players: { disconnect: { id: playerId } },
      },
      include: { players: true },
    });
  },
};
