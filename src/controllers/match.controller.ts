import { Request, Response } from 'express';
import { MatchRepository } from '../repositories/match.repository';
import { MatchService } from '../services/match.service';
import { NotFoundError } from '../errors/notFound.error';
import { ConflictError } from '../errors/conflict.error';
import { ValidationError } from '../errors/validation.error';


export const MatchController = {
  getAllMatches: async (req: Request, res: Response) => {
    const matches = await MatchRepository.findAllMatches();

    if (!matches || matches.length === 0) {
      throw new NotFoundError('Nenhuma partida encontrada.');
    }

    return res.status(200).json(matches);
  },

  createNewMatch: async (req: Request, res: Response) => {
    const { name } = req.body;

    const existingMatch = await MatchRepository.findMatchByName(name);
    if (existingMatch) {
      throw new ConflictError('Já existe uma partida com esse nome.');
    }

    const match = await MatchRepository.createMatch(name);
    const { id, ...matchView } = match;
    return res.status(201).json(matchView);
  },

  getOpenMatches: async (req: Request, res: Response) => {
    const matches = await MatchRepository.findOpenMatches();

    if (!matches || matches.length === 0) {
      throw new NotFoundError('Nenhuma partida aberta encontrada.');
    }

    const matchesView = matches.map(({ id, ...rest }) => rest);
    return res.status(200).json(matchesView);
  },

  getPlayerHistory: async (req: Request, res: Response) => {
    const { playerId } = req.params;

    const history = await MatchService.getPlayerHistory(playerId);
    if (!history || history.length === 0) {
      throw new NotFoundError('Nenhum histórico encontrado para este jogador.');
    }

    return res.status(200).json(history);
  },

  addPlayerToMatch: async (req: Request, res: Response) => {
    const { matchId, playerId } = req.params;

    const match = await MatchService.joinMatch(matchId, playerId);
    if (!match) throw new NotFoundError('Partida ou jogador não encontrados.');

    return res.status(200).json(match);
  },

  removePlayerFromMatch: async (req: Request, res: Response) => {
    const { matchId, playerId } = req.params;

    const match = await MatchService.leaveMatch(matchId, playerId);
    if (!match) throw new NotFoundError('Partida ou jogador não encontrados.');

    return res.status(200).json(match);
  },

  startMatchById: async (req: Request, res: Response) => {
    const { matchId } = req.params;

    const match = await MatchService.startMatch(matchId);
    if (!match) throw new NotFoundError('Partida não encontrada.');

    return res.status(200).json(match);
  },

  finishMatchById: async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { scores } = req.body;

    if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
      throw new ValidationError('Os scores são obrigatórios e devem estar no formato { "playerId": pontuacao }.');
    }

    const match = await MatchService.finishMatch(matchId, scores);
    if (!match) throw new NotFoundError('Partida não encontrada.');

    return res.status(200).json(match);
  },
};
