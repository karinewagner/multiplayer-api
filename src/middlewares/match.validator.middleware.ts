import { Request, Response, NextFunction } from "express";

export const validateMatch = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body || {};

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "O nome da partida é obrigatório." });
  }

  next();
};
