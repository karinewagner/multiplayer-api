import { prisma } from '../database/prisma';
import { Player } from '@prisma/client';

export const PlayerRepository = {
  findAll: async (): Promise<Player[]> => {
    return await prisma.player.findMany();
  },

  findById: async (id: string): Promise<Player | null> => {
    return await prisma.player.findUnique({ where: { id } });
  },

  create: async (data: Omit<Player, 'id'>): Promise<Player> => {
    return await prisma.player.create({
      data: {
        name: data.name,
        nickname: data.nickname,
        email: data.email,
      },
    });
  },

  update: async (id: string, data: Partial<Player>): Promise<Player | null> => {
    try {
      return await prisma.player.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  },

  delete: async (id: string): Promise<void> => {
    await await prisma.player.delete({ where: { id } });
  },
};
