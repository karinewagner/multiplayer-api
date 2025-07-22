import { Request, Response, NextFunction } from 'express';

export const validateFinishMatch = (req: Request, res: Response, next: NextFunction) => {
  const { scores } = req.body;
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return res.status(400).json({ error: 'Os scores são obrigatórios para finalizar a partida.' });
  }
  next();
};
