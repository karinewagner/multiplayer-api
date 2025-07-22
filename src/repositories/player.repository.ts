import { prisma } from '../database/prisma';
import { Player } from '@prisma/client';

export const PlayerRepository = {
  findAllPlayers: async (): Promise<Player[]> => {
    return await prisma.player.findMany();
  },

  createPlayer: async (data: Omit<Player, 'id'>): Promise<Player> => {
    return await prisma.player.create({data});
  },

  findPlayerById: async (id: string): Promise<Player | null> => {
    return await prisma.player.findUnique({ where: { id } });
  },

  updatePlayerById: async (
    id: string,
    data: Partial<Player>
  ): Promise<{ player?: Player; reason?: string }> => {
    try {
      const player = await prisma.player.findUnique({ where: { id } });

      if (!player) {
        return { reason: "NOT_FOUND" };
      }

      if (player.matchId) {
        return { reason: "IN_MATCH" };
      }

      const updatedPlayer = await prisma.player.update({
        where: { id },
        data,
      });

      return { player: updatedPlayer };
    } catch (error) {
      console.error("Erro ao atualizar jogador:", error);
      return { reason: "ERROR" };
    }
  },

  deletePlayerById: async (id: string): Promise<{ success: boolean; reason?: string }> => {
    try {
      const player = await prisma.player.findUnique({ where: { id } });

      if (!player) {
        return { success: false, reason: "NOT_FOUND" };
      }

      if (player.matchId) {
        return { success: false, reason: "IN_MATCH" };
      }

      await prisma.player.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir jogador:", error);
      return { success: false, reason: "ERROR" };
    }
  },
};
