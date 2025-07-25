import { Request, Response } from 'express';
import { MatchRepository } from '../repositories/match.repository';
import { MatchService } from '../services/match.service';

import { NotFoundError } from '../errors/not-found.error';
import { ConflictError } from '../errors/conflict.error';
import { ValidationError } from '../errors/validation.error';

export const MatchController = {
  getAllMatches: async (req: Request, res: Response) => {
    const matches = await MatchRepository.findAllMatches();

    if (!matches.length) {
      throw new NotFoundError('Nenhuma partida encontrada.');
    }

    res.status(200).json(matches);
  },

  createNewMatch: async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name) {
      throw new ValidationError('O nome da partida é obrigatório.');
    }

    const existingMatch = await MatchRepository.findMatchByName(name);

    if (existingMatch) {
      throw new ConflictError('Já existe uma partida com esse nome.');
    }

    const match = await MatchRepository.createMatch(name);

    res.status(201).json(match);
  },

  getOpenMatches: async (req: Request, res: Response) => {
    const matches = await MatchRepository.findOpenMatches();

    if (!matches.length) {
      throw new NotFoundError('Nenhuma partida aberta encontrada.');
    }

    res.status(200).json(matches);
  },

  getPlayerHistory: async (req: Request, res: Response) => {
    const { playerId } = req.params;

    if (!playerId) {
      throw new ValidationError('O ID do jogador é obrigatório.');
    }

    const history = await MatchService.getPlayerHistory(playerId);

    if (!history.length) {
      throw new NotFoundError('Nenhum histórico encontrado para este jogador.');
    }

    res.status(200).json(history);
  },

  addPlayerToMatch: async (req: Request, res: Response) => {
    const { matchId, playerId } = req.params;

    if (!matchId || !playerId) {
      throw new ValidationError('matchId e playerId são obrigatórios.');
    }

    const match = await MatchService.joinMatch(matchId, playerId);

    res.status(200).json(match);
  },

  removePlayerFromMatch: async (req: Request, res: Response) => {
    const { matchId, playerId } = req.params;

    if (!matchId || !playerId) {
      throw new ValidationError('matchId e playerId são obrigatórios.');
    }

    const match = await MatchService.leaveMatch(matchId, playerId);

    res.status(200).json(match);
  },

  startMatchById: async (req: Request, res: Response) => {
    const { matchId } = req.params;

    if (!matchId) {
      throw new ValidationError('O ID da partida é obrigatório.');
    }

    const match = await MatchService.startMatch(matchId);

    res.status(200).json(match);
  },

  finishMatchById: async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { scores } = req.body;

    if (!matchId) {
      throw new ValidationError('O ID da partida é obrigatório.');
    }

    if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
      throw new ValidationError('Scores devem estar no formato { "playerId": pontuacao }.');
    }

    const match = await MatchService.finishMatch(matchId, scores);

    res.status(200).json(match);
  },
};
