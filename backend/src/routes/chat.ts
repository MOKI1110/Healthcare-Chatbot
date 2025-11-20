import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { handleMessage, handleTriage } from '../services/chatbotService';
import { translateViaM2M100 } from '../services/translationService'; // <-- MAKE SURE TO IMPLEMENT THIS
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

    let { message, conversationHistory = [], locale = 'en', sessionId } = req.body;
    console.log(`Chat request from session ${sessionId}: "${message}"`);
    console.log(`Conversation history length: ${conversationHistory.length}`);

    let translatedInput = message;
    let response = null;

    try {
      // Step 1: Translate incoming message to English if needed
      if (locale !== 'en') {
        translatedInput = await translateViaM2M100(message, locale, 'en');
      }

      // Step 2: Handle triage or normal message (in English)
      if (/triage/i.test(translatedInput)) {
        response = await handleTriage(translatedInput, sessionId, conversationHistory, 'en');
      } else {
        response = await handleMessage(translatedInput, sessionId, conversationHistory, 'en');
      }

      // Step 3: Translate response back to user's language, if needed
      let output = response;
      if (locale !== 'en') {
        output = await translateViaM2M100(response, 'en', locale);
      }

      res.json({ message: output });
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
