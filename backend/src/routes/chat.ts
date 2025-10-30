import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { handleMessage, handleTriage } from '../services/chatbotService';
import { Request, Response } from 'express';


const router = Router();

router.post(
  '/',
  [
    body("message").isString().trim().notEmpty().isLength({ max: 1024 }),
    body("locale").optional().isString(),
    body("sessionId").exists().isString().isLength({ min: 8 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: "Invalid input", details: errors.array() });
    }

    const { message, locale, sessionId } = req.body;
    let response = null;
    // If the message is a "triage" intent, call triage logic, else general chatbot Q&A.
    if (/triage/i.test(message)) {
      response = await handleTriage(message, sessionId, locale);
    } else {
      response = await handleMessage(message, sessionId, locale);
    }

    // i18n handled within services
    res.json({ message: response });
  }
);

export default router;
