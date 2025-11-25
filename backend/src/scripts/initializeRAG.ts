/**
 * RAG System Initialization Script
 *
 * This version loads precomputed embeddings exported from the Python RAG pipeline.
 * No OpenRouter embedding calls. No CSV indexing. No sample documents.
 *
 * Usage:
 *   ts-node src/scripts/initializeRAG.ts
 */

import { loadPrecomputedEmbeddings, vectorStore } from "../services/ragService";

async function main() {
  console.log("🚀 Initializing RAG system...\n");

  try {
    console.log("📦 Loading precomputed MedlinePlus embeddings...");
    await loadPrecomputedEmbeddings();

    const count = vectorStore.getDocuments().length;

    if (count === 0) {
      console.warn(
        "⚠️  No documents were loaded. Check that file exists at src/data/medlineplus_embeddings.jsonl"
      );
    } else {
      console.log(`✅ Loaded ${count} medical chunks into vector store.`);
    }

    console.log("\n🎉 RAG system is ready to use!");
  } catch (error: any) {
    console.error("❌ RAG initialization failed:", error.message || error);
    process.exit(1);
  }
}

main();
