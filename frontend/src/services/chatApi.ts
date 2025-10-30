// src/services/chatApi.ts

/**
 * Sends a user's message to the chatbot backend and returns the bot's reply.
 * @param message The user's message/text string (required)
 * @param locale Optional language/locale code ("en", "es", etc.). Defaults to "en".
 * @param sessionId Required: a random unique id for the user/session (helps backend keep track of chat)
 * @returns The bot's reply string.
 * @throws Error if the backend API call fails
 */
export async function sendChatMessage({
    message,
    locale = "en",
    sessionId,
  }: {
    message: string;
    locale?: string;
    sessionId: string;
  }): Promise<string> {
    const response = await fetch("http://localhost:4000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        locale,
        sessionId,
      }),
    });
  
    if (!response.ok) {
      throw new Error("Network error connecting to backend");
    }
  
    const data = await response.json();
    return data.message;
  }
  