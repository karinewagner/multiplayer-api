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

      const playersView  = players.map(({ id, ...rest }) => rest);

      res.json(playersView);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  createPlayer: async (req: Request, res: Response) => {
    const { name, nickname, email, matchId } = req.body;

    try {
      const player = await PlayerRepository.createPlayer({ name, nickname, email, matchId });

      const { id, ...playersView } = player;

      return res.status(201).json(playersView);
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

      const { id, ...playersView } = player;

      res.status(200).json(playersView);
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  updatePlayerById: async (req: Request, res: Response) => {
    try {
      const result = await PlayerRepository.updatePlayerById(req.params.id, req.body);

      if (!result.player) {
        if (result.reason === "NOT_FOUND") {
          return res.status(404).json({ error: "Jogador não encontrado." });
        }
        if (result.reason === "IN_MATCH") {
          return res.status(400).json({ error: "Jogador está em uma partida e não pode ser atualizado." });
        }
        return res.status(500).json({ error: "Erro ao atualizar jogador." });
      }

      const { id, ...playerView } = result.player;
      res.status(200).json({
        message: "Dados atualizado com sucesso!",
        updatePlayer: playerView
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },

  deletePlayerById: async (req: Request, res: Response) => {
    try {
      const result = await PlayerRepository.deletePlayerById(req.params.id);

      if (!result.success) {
        if (result.reason === "NOT_FOUND") {
          return res.status(404).json({ error: "Jogador não encontrado para exclusão." });
        }
        if (result.reason === "IN_MATCH") {
          return res.status(400).json({ error: "Jogador não pode ser excluído, pois está em uma partida." });
        }
        return res.status(500).json({ error: "Erro ao excluir jogador." });
      }

      res.status(200).json({ message: "Jogador excluído com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
};
