import app from "./app";
import config from "./config";
import { vectorStore, loadPrecomputedEmbeddings } from "./services/ragService";

const PORT = process.env.PORT || 4000;

async function initializeServer() {
  try {
    // Initialize RAG system if enabled
    if (config.RAG_ENABLED) {
      console.log("🚀 Initializing RAG system...");

      // 🔹 Load precomputed MedlinePlus embeddings from Python pipeline
      await loadPrecomputedEmbeddings();

      const docCount = vectorStore.getDocuments().length;

      if (docCount === 0) {
        console.warn(
          "⚠️  Vector store is still empty after loading precomputed embeddings.\n" +
            "   Make sure src/data/medlineplus_embeddings.jsonl exists and is not empty."
        );
      } else {
        console.log(
          `✅ RAG system ready with ${docCount} document chunks indexed (from Python pipeline)`
        );
      }
    } else {
      console.log("ℹ️  RAG system is disabled (RAG_ENABLED=false)");
    }
  } catch (error: any) {
    console.error("⚠️  RAG initialization failed:", error?.message || error);
    console.log(
      "ℹ️  Chatbot will continue without RAG. You can add documents later."
    );
  }
}

// Initialize server
initializeServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n✅ Healthcare Chatbot server running on port ${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   - POST /api/chat`);
      console.log(`   - POST /api/upload`);
    });
  })
  .catch((error) => {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);
  });
