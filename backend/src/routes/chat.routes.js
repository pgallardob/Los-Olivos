import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller.js';
import { config } from '../config/config.js';

export const chatRouter = Router();

chatRouter.post('/chat', (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'El campo "message" es obligatorio.' });
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  if (trimmed.length > config.chat.maxMessageLength) {
    return res.status(400).json({
      error: `El mensaje no puede superar los ${config.chat.maxMessageLength} caracteres.`,
    });
  }

  next();
}, handleChat);
