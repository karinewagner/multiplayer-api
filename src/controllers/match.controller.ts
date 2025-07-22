import { Request, Response, NextFunction } from 'express';

import { MatchRepository } from '../repositories/match.repository';
import { MatchService } from '../services/match.service';

export const MatchController = {
  getAllMatches: async (req: Request, res: Response) => {
    try {
      const matches = await MatchRepository.findAllMatches();

      if (!matches || matches.length === 0) {
        return res.status(404).json({ message: 'Nenhuma partida encontrada.' });
      }

      const matchesView  = matches.map(({ id, ...rest }) => rest);

      return res.status(200).json(matchesView);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  createNewMatch: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      const existingMatch = await MatchRepository.findMatchByName(name);

      if (existingMatch) {
        return res.status(409).json({ error: 'Já existe uma partida com esse nome.' });
      }

      const match = await MatchRepository.createMatch(name);

      const { id, ...matchView } = match;

      return res.status(201).json(matchView);
    } catch (error) {
      console.error('Erro ao criar partida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  getOpenMatches: async (req: Request, res: Response) => {
    try {
      const matches = await MatchRepository.findOpenMatches();

      if (!matches || matches.length === 0) {
        return res.status(404).json({ message: 'Nenhuma partida aberta encontrada.' });
      }

      const matchesView  = matches.map(({ id, ...rest }) => rest);

      return res.status(200).json(matchesView);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  getPlayerHistory: async (req: Request, res: Response) => {
    try {
      const { playerId } = req.params;

      const history = await MatchService.getPlayerHistory(playerId);

      if (!history || history.length === 0) {
        return res.status(404).json({ message: 'Nenhum histórico encontrado para este jogador.' });
      }

      return res.status(200).json(history);
    } catch (error) {
      console.error('Erro ao buscar histórico do jogador:', error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  addPlayerToMatch: async (req: Request, res: Response) => {
    try {
      const { matchId, playerId } = req.params;

      const match = await MatchService.joinMatch(matchId, playerId);

      if (!match) {
        return res.status(404).json({ error: 'Partida ou jogador não encontrados.' });
      }

      return res.status(200).json(match);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  removePlayerFromMatch: async (req: Request, res: Response) => {
    try {
      const { matchId, playerId } = req.params;
      
      const match = await MatchService.leaveMatch(matchId, playerId);

      if (!match) {
        return res.status(404).json({ error: 'Partida ou jogador não encontrados.' });
      }

      return res.status(200).json(match);
    } catch (error: any) {
      if (error.message === 'Partida não encontrada.' || error.message === 'Jogador não encontrado.') {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === 'O jogador não está participando desta partida.') {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  startMatchById: async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;

      const match = await MatchService.startMatch(matchId);

      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada.' });
      }

      return res.status(200).json(match);
    } catch (error: any) {
      if (
        error.message === 'A partida já está em andamento.' ||
        error.message === 'A partida já foi finalizada e não pode ser iniciada novamente.' ||
        error.message === 'Não é possível iniciar uma partida sem jogadores.'
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },

  finishMatchById: async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const { scores } = req.body;

      if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
        return res.status(400).json({
          error: 'Os scores são obrigatórios e devem estar no formato { "playerId": pontuacao }.'
        });
      }

      const match = await MatchService.finishMatch(matchId, scores);

      if (!match) {
        return res.status(404).json({ error: 'Partida não encontrada.' });
      }

      return res.status(200).json(match);
    } catch (error: any) {
      const mensagensEsperadas = [
        'A partida não foi inicializada.',
        'A partida já foi finalizada.',
        'O(s) seguinte(s) jogador(es) não pertence(m) à partida:',
        'Faltam pontuações para o(s) jogadore(s):'
      ];

      if (mensagensEsperadas.some(msg => error.message.startsWith(msg))) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  },
};
