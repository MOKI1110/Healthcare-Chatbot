/**
 * RAG System Initialization Script
 * 
 * Run this script to initialize the RAG system with healthcare documents
 * Usage: ts-node src/scripts/initializeRAG.ts
 */

import { initializeRAGSystem } from "../utils/documentIndexer";
import { indexDocuments } from "../services/ragService";

async function main() {
  console.log("🚀 Initializing RAG System for Healthcare Chatbot...\n");
  
  try {
    // Initialize with default healthcare dataset
    await initializeRAGSystem();
    
    // Example: Add custom medical documents
    // Uncomment and modify as needed:
    /*
    await indexDocuments([
      {
        content: `Medical Guideline: Hypertension Management
        
        Hypertension, or high blood pressure, is a common condition that requires careful management.
        
        Key Points:
        - Normal BP: <120/80 mmHg
        - Stage 1 Hypertension: 130-139/80-89 mmHg
        - Stage 2 Hypertension: ≥140/90 mmHg
        
        Treatment approaches:
        1. Lifestyle modifications (diet, exercise, stress reduction)
        2. Medication when lifestyle changes are insufficient
        3. Regular monitoring and follow-up
        
        Always consult with a healthcare provider for personalized treatment plans.`,
        metadata: {
          source: "hypertension_guidelines",
          documentType: "guideline",
          section: "cardiovascular",
        },
      },
    ]);
    */
    
    console.log("\n✅ RAG System initialized successfully!");
    console.log("📚 The chatbot is now ready to use RAG for context-aware responses.");
  } catch (error: any) {
    console.error("❌ Initialization failed:", error.message);
    process.exit(1);
  }
}

main();

