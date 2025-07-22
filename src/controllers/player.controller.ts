import { Request, Response } from 'express';
import { PlayerRepository } from '../repositories/player.repository';

export const PlayerController = {
  getAll: (req: Request, res: Response) => {
    res.json(PlayerRepository.findAll());
  },
  create: (req: Request, res: Response) => {
    const { name, nickname, email, matchId } = req.body;
    if (!name || !nickname || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    const player = PlayerRepository.create({ name, nickname, email, matchId });
    res.status(201).json(player);
  },
  getById: (req: Request, res: Response) => {
    const player = PlayerRepository.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  },
  update: (req: Request, res: Response) => {
    const updated = PlayerRepository.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Player not found' });
    res.json(updated);
  },
  remove: (req: Request, res: Response) => {
    PlayerRepository.delete(req.params.id);
    res.status(204).send();
  }
};
