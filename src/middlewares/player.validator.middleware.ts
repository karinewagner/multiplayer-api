import { Request, Response, NextFunction } from "express";

export const validatePlayer = (req: Request, res: Response, next: NextFunction) => {
  const { name, nickname, email } = req.body;
  
  if (!name || !/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
    return res.status(400).json({ error: "Nome inválido. Use apenas letras e espaços." });
  }

  if (!nickname || nickname.trim() === "") {
    return res.status(400).json({ error: "Nickname é obrigatório." });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  next();
};
