import { prisma } from '../database/prisma';
import { Player } from '@prisma/client';
import { NotFoundError } from '../errors/notFound.error';
import { ValidationError } from '../errors/validation.error';

export const PlayerRepository = {
  findAllPlayers: async (): Promise<Player[]> => {
    return await prisma.player.findMany();
  },

  createPlayer: async (data: Omit<Player, 'id'>): Promise<Player> => {
    return await prisma.player.create({ data });
  },

  findPlayerById: async (id: string): Promise<Player | null> => {
    return await prisma.player.findUnique({ where: { id } });
  },

  updatePlayerById: async (id: string, data: Partial<Player>): Promise<Player> => {
    const player = await prisma.player.findUnique({ where: { id } });

    if (!player) {
      throw new NotFoundError('Jogador não encontrado.');
    }

    const isLeavingMatchOnly =
      player.matchId && Object.keys(data).length === 1 && data.matchId === null;

    if (player.matchId && !isLeavingMatchOnly) {
      throw new ValidationError('Jogador está em uma partida e não pode ser atualizado.');
    }

    return await prisma.player.update({
      where: { id },
      data,
    });
  },

  deletePlayerById: async (id: string): Promise<void> => {
    const player = await prisma.player.findUnique({ where: { id } });

    if (!player) {
      throw new NotFoundError('Jogador não encontrado.');
    }

    if (player.matchId) {
      throw new ValidationError('Jogador não pode ser excluído pois está em uma partida.');
    }

    await prisma.player.delete({ where: { id } });
  },
};
