import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/validation.error";

export const validateMatch = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body || {};

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new ValidationError("O nome da partida é obrigatório.");
  }

  next();
};
