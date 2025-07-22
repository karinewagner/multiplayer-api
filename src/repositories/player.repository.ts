import { prisma } from '../database/prisma';
import { Player } from '@prisma/client';

export const PlayerRepository = {
  findAllPlayers: async (): Promise<Player[]> => {
    return await prisma.player.findMany();
  },

  findPlayerById: async (id: string): Promise<Player | null> => {
    return await prisma.player.findUnique({ where: { id } });
  },

  createPlayer: async (data: Omit<Player, 'id'>): Promise<Player> => {
    return await prisma.player.create({data});
  },

  updatePlayerById: async (id: string, data: Partial<Player>): Promise<Player | null> => {
    try {
      return await prisma.player.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  },

  deletePlayerById: async (id: string): Promise<boolean> => {
    try {
      await prisma.player.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  },
};
