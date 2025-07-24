import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/validation.error";

export const validatePlayer = (req: Request, res: Response, next: NextFunction) => {
  const { name, nickname, email } = req.body;

  if (!name || !/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
    throw new ValidationError("Nome inválido. Use apenas letras e espaços.");
  }

  if (!nickname || nickname.trim() === "") {
    throw new ValidationError("Nickname é obrigatório.");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ValidationError("E-mail inválido.");
  }

  next();
};
