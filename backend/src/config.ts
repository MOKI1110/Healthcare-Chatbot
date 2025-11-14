import dotenv from "dotenv";
dotenv.config();

export default {
  PORT: process.env.PORT || "4000",
  NODE_ENV: process.env.NODE_ENV || "development",

  // OpenRouter API Key (for DeepSeek and embeddings)
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY as string,

  // RAG Configuration
  RAG_ENABLED: process.env.RAG_ENABLED !== "false", // Default: true
  RAG_TOP_K: parseInt(process.env.RAG_TOP_K || "5"),
  RAG_SIMILARITY_THRESHOLD: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.3"),

};
