// src/app.ts
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

import chatRouter from './routes/chat';
import uploadRouter from './routes/upload';
import ragRouter from './routes/rag';
import localizationMiddleware from './middleware/localization';

const app = express();

// Security Headers
app.use(helmet());

// CORS
app.use(cors({ origin: true, credentials: true }));

// Rate Limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 1000 });
app.use(limiter);

// JSON Body Parser
app.use(express.json({ limit: '2mb' }));

// i18n Internationalization
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'es'],
    backend: { loadPath: __dirname + '/locales/{{lng}}.json' }
  });
app.use(i18nextMiddleware.handle(i18next));
app.use(localizationMiddleware);

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/rag', ragRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Health Chatbot API running with file upload support.' });
});

export default app;
