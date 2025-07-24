import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/validation.error';

export const validateFinishMatch = (req: Request, res: Response, next: NextFunction) => {
  const { scores } = req.body;

  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    throw new ValidationError('Os scores são obrigatórios para finalizar a partida.');
  }

  next();
};
