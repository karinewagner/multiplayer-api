import { Request, Response } from 'express';
import { MatchRepository } from '../repositories/match.repository';
import { MatchService } from '../services/match.service';

export const MatchController = {
  getAll: (req: Request, res: Response) => {
    res.json(MatchRepository.findAll());
  },

  create: (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const match = MatchRepository.create(name);
    res.status(201).json(match);
  },

  getOpenMatches: (req: Request, res: Response) => {
    res.json(MatchRepository.findOpenMatches());
  },

  getPlayerHistory: (req: Request, res: Response) => {
    const { playerId } = req.params;
    const history = MatchService.getPlayerHistory(playerId);
    res.json(history);
  },

  joinMatch: (req: Request, res: Response) => {
    try {
      const { matchId, playerId } = req.params;
      const match = MatchService.joinMatch(matchId, playerId);
      if (!match) return res.status(404).json({ error: 'Match or Player not found' });
      res.json(match);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  leaveMatch: (req: Request, res: Response) => {
    const { matchId, playerId } = req.params;
    const match = MatchService.leaveMatch(matchId, playerId);
    if (!match) return res.status(404).json({ error: 'Match or Player not found' });
    res.json(match);
  },

  startMatch: (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const match = MatchService.startMatch(matchId);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  finishMatch: (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { scores } = req.body;
    const match = MatchService.finishMatch(matchId, scores);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  }
};
