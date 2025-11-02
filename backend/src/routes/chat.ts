import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { handleMessage, handleTriage } from '../services/chatbotService';
import { Request, Response } from 'express';

const router = Router();

router.post(
  '/',
  [
    body("message").isString().trim().notEmpty().isLength({ max: 1024 }),
    body("conversationHistory").optional().isArray(),
    body("locale").optional().isString(),
    body("sessionId").exists().isString().isLength({ min: 8 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: "Invalid input", details: errors.array() });
    }

    const { message, conversationHistory = [], locale = 'en', sessionId } = req.body;

    console.log(`Chat request from session ${sessionId}: "${message}"`);
    console.log(`Conversation history length: ${conversationHistory.length}`);

    let response = null;

    try {
      // If the message is a "triage" intent, call triage logic, else general chatbot Q&A.
      if (/triage/i.test(message)) {
        response = await handleTriage(message, sessionId, conversationHistory, locale);
      } else {
        response = await handleMessage(message, sessionId, conversationHistory, locale);
      }

      res.json({ message: response });
    } catch (error: any) {
      console.error('Chat route error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response',
        message: 'Sorry, I encountered an error. Please try again.'
      });
    }
  }
);

export default router;
