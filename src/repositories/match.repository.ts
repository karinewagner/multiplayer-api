import { prisma } from '../database/prisma';
import { MatchState, Match } from '@prisma/client';

export const MatchRepository = {
  findAllMatches: async (): Promise<Match[]> => {
    return await prisma.match.findMany({ include: { players: true } })
  },

  findMatchById: async (id: string) => {
    return await prisma.match.findUnique({ where: { id }, include: { players: true } })
  },

  findOpenMatches: async () => {
    return await prisma.match.findMany({ where: { state: MatchState.WAITING }, include: { players: true } })
  },

  findMatchByName: async (name: string): Promise<Match | null> => {
    return await prisma.match.findUnique({
      where: {
        name: name,
      },
    });
  },

  createMatch: async (name: string) => {
    return await prisma.match.create({ data: { name } })
  },

  updateMatchById: async (id: string, data: any) => {
    return await prisma.match.update({ where: { id }, data })
  },
  
  deleteMatchById: async (id: string) => {
    return await prisma.match.delete({ where: { id } })
  },
  
  addPlayerToMatch: async (matchId: string, playerId: string) => {
    return await prisma.match.update({
      where: { id: matchId },
      data: {
        players: {
          connect: { id: playerId },
        },
      },
      include: { players: true },
    });
  },

  removePlayerFromMatch: async (matchId: string, playerId: string) => {
    return await prisma.match.update({
      where: { id: matchId },
      data: {
        players: {
          disconnect: { id: playerId },
        },
      },
      include: { players: true },
    });
  },
};
