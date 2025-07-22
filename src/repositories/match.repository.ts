import { prisma } from '../database/prisma';
import { MatchState } from '@prisma/client';

export const MatchRepository = {
  findAll: async () => await prisma.match.findMany({ include: { players: true } }),

  findById: async (id: string) => await prisma.match.findUnique({ where: { id }, include: { players: true } }),

  findOpenMatches: async () => await prisma.match.findMany({ where: { state: MatchState.WAITING }, include: { players: true } }),

  create: async (name: string) => await prisma.match.create({ data: { name } }),

  update: async (id: string, data: any) => await prisma.match.update({ where: { id }, data }),
  
  delete: async (id: string) => await prisma.match.delete({ where: { id } }),
  
  addPlayer: async (matchId: string, playerId: string) => {
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

  removePlayer: async (matchId: string, playerId: string) => {
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
