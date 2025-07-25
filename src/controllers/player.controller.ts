import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

import { PlayerRepository } from '../repositories/player.repository';
import { NotFoundError } from '../errors/not-found.error';
import { ConflictError } from '../errors/conflict.error';
import { ValidationError } from '../errors/validation.error';

export const PlayerController = {
  getPlayersList: async (req: Request, res: Response) => {
    const players = await PlayerRepository.findAllPlayers();

    if (players.length === 0) {
      throw new NotFoundError('Nenhum jogador encontrado');
    }

    res.json(players);
  },

  createPlayer: async (req: Request, res: Response) => {
    const { name, nickname, email, matchId } = req.body;

    try {
      const player = await PlayerRepository.createPlayer({ name, nickname, email, matchId });
      const { id, ...playerView } = player;
      res.status(201).json(playerView);
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = Array.isArray(error.meta?.target) ? error.meta.target[0] : undefined;
        const message = field === 'email'
          ? 'Este e-mail já está em uso.'
          : field === 'nickname'
            ? 'Este nickname já está em uso.'
            : 'Campo duplicado.';

        throw new ConflictError(message);
      }

      throw error;
    }
  },

  getPlayerById: async (req: Request, res: Response) => {
    const player = await PlayerRepository.findPlayerById(req.params.id);
    if (!player) throw new NotFoundError('Jogador não localizado');

    const { id, ...playerView } = player;
    res.status(200).json(playerView);
  },

  updatePlayerById: async (req: Request, res: Response) => {
    const playerId = req.params.id;

    if (!playerId) {
      throw new ValidationError('ID do jogador é obrigatório.');
    }

    const player = await PlayerRepository.updatePlayerById(playerId, req.body);

    const { id, ...playerView } = player;

    res.status(200).json({
      message: 'Dados atualizados com sucesso!',
      updatePlayer: playerView,
    });
  },

  deletePlayerById: async (req: Request, res: Response) => {
    const playerId = req.params.id;

    if (!playerId) {
      throw new ValidationError('ID do jogador é obrigatório.');
    }

    await PlayerRepository.deletePlayerById(playerId);

    res.status(200).json({ message: 'Jogador excluído com sucesso!' });
  },
};
