# Accessible Health Chatbot Backend

- API endpoint: `POST /api/chat`
- Body: `{ message: string, locale?: string, sessionId: string }`
- Returns: `{ message: string }`

## Security/Privacy

- Never stores user messages permanently.
- Strict rate-limiting and input validation.
- Responds in the requested locale (if available).

## Dev Quickstart

1. `npm install`
2. Create `.env` with your OpenAI key.
3. `npm run dev`
