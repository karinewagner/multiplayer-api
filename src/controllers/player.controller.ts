import { Request, Response } from 'express';
import { Prisma } from "@prisma/client";

import { PlayerRepository } from '../repositories/player.repository';

export const PlayerController = {
  getPlayersList: async (req: Request, res: Response) => {
    try {
      const players = await PlayerRepository.findAllPlayers();

      if (players.length === 0) {
        return res.status(404).json({ message: "Nenhum jogador encontrado" });
      }

      const sanitizedPlayers = players.map(({ id, ...rest }) => rest);

      res.json(sanitizedPlayers);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  createPlayer: async (req: Request, res: Response) => {
    const { name, nickname, email, matchId } = req.body;

    try {
      const player = await PlayerRepository.createPlayer({ name, nickname, email, matchId });

      return res.status(201).json(player);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
              const field = Array.isArray(error.meta?.target) ? error.meta.target[0] : undefined;

              if (field === "email") {
                return res.status(400).json({ error: "Este e-mail já está em uso." });

              } else if (field === "nickname") {
                return res.status(400).json({ error: "Este nickname já está em uso." });
              }
        }
      }
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  },

  getPlayerById: async (req: Request, res: Response) => {
    try {
      const player = await PlayerRepository.findPlayerById(req.params.id);

      if (!player) return res.status(404).json({ error: 'Jogador não localizado!' });

      res.status(200).json(player);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  updatePlayerById: async (req: Request, res: Response) => {
    try {
      const updated = await PlayerRepository.updatePlayerById(req.params.id, req.body);
      
      if (!updated) return res.status(404).json({ error: 'Jogador não localizado!' });

      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  deletePlayerById: async (req: Request, res: Response) => {
    try {
      await PlayerRepository.deletePlayerById(req.params.id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
};
