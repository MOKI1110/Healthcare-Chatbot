export interface ChatMessage {
    sender: "user" | "bot";
    content: string;
    timestamp: number;
    language: string;
  }
  