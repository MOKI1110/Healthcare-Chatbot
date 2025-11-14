/**
 * RAG Usage Examples
 * 
 * This file contains practical examples of using the RAG system
 * in a healthcare chatbot context.
 */

import { retrieveContext, indexDocuments, chunkDocument } from "../services/ragService";
import ragContextManager from "../services/ragContextManager";

// ============================================
// Example 1: Basic Query with RAG
// ============================================

export async function exampleBasicQuery() {
  const query = "What are the symptoms of diabetes?";
  const conversationHistory: any[] = [];

  const context = await retrieveContext(query, conversationHistory);
  
  console.log(`Retrieved ${context.retrievedDocs.length} relevant documents`);
  context.retrievedDocs.forEach((doc, idx) => {
    console.log(`\n[${idx + 1}] Similarity: ${(doc.similarity * 100).toFixed(1)}%`);
    console.log(`Source: ${doc.chunk.metadata.source}`);
    console.log(`Content: ${doc.chunk.content.substring(0, 100)}...`);
  });
}

// ============================================
// Example 2: Multi-Turn Conversation
// ============================================

export async function exampleMultiTurnConversation() {
  const sessionId = "user_123";
  
  // First turn
  const query1 = "I have been experiencing frequent headaches";
  const history1: any[] = [];
  
  const context1 = await retrieveContext(query1, history1);
  ragContextManager.addRAGContext(sessionId, context1);
  
  // Second turn (with context)
  const query2 = "What could be causing them?";
  const history2 = [
    { role: "user", content: query1 },
    { role: "assistant", content: "I understand you're experiencing headaches..." }
  ];
  
  const context2 = await retrieveContext(query2, history2);
  ragContextManager.addRAGContext(sessionId, context2);
  
  // Get relevant context from conversation
  const relevantContext = ragContextManager.getRelevantContext(sessionId, query2);
  console.log("Relevant entities:", relevantContext.relevantEntities);
  console.log("Conversation summary:", relevantContext.conversationSummary);
}

// ============================================
// Example 3: Filtered Retrieval
// ============================================

export async function exampleFilteredRetrieval() {
  // Retrieve only medical guidelines
  const context = await retrieveContext(
    "How should hypertension be managed?",
    [],
    {
      documentType: "guideline",
      topK: 3,
      threshold: 0.4 // Higher threshold for guidelines
    }
  );
  
  console.log(`Found ${context.retrievedDocs.length} guideline documents`);
}

// ============================================
// Example 4: Indexing Medical Documents
// ============================================

export async function exampleIndexing() {
  // Index a medical guideline
  await indexDocuments([
    {
      content: `
Medical Guideline: Diabetes Management

Type 2 Diabetes is a chronic condition that affects how your body processes blood sugar.

Key Management Strategies:
1. Blood Sugar Monitoring: Check levels regularly
2. Medication: As prescribed by healthcare provider
3. Diet: Low-carb, high-fiber foods
4. Exercise: 150 minutes per week of moderate activity
5. Regular Check-ups: Annual eye, foot, and kidney exams

Warning Signs:
- High blood sugar: Excessive thirst, frequent urination
- Low blood sugar: Dizziness, confusion, sweating

Always consult with a healthcare provider for personalized treatment plans.
      `.trim(),
      metadata: {
        source: "diabetes_guidelines_2024",
        documentType: "guideline",
        section: "endocrinology",
        timestamp: new Date().toISOString()
      }
    }
  ]);
  
  console.log("Document indexed successfully!");
}

// ============================================
// Example 5: Document Chunking
// ============================================

export async function exampleChunking() {
  const longDocument = `
    Medical Research Paper: Cardiovascular Health
    
    Introduction:
    Cardiovascular disease remains the leading cause of death worldwide.
    This study examines the impact of lifestyle interventions on heart health.
    
    Methods:
    We conducted a randomized controlled trial with 1000 participants...
    
    Results:
    Participants in the intervention group showed significant improvements...
    
    Conclusion:
    Lifestyle modifications are effective in reducing cardiovascular risk.
  `;
  
  const chunks = chunkDocument(longDocument, {
    source: "research_paper_2024",
    documentType: "research",
    section: "cardiovascular"
  });
  
  console.log(`Document split into ${chunks.length} chunks`);
  chunks.forEach((chunk, idx) => {
    console.log(`\nChunk ${idx + 1} (${chunk.content.length} chars):`);
    console.log(chunk.content.substring(0, 100) + "...");
  });
}

// ============================================
// Example 6: Context Management
// ============================================

export async function exampleContextManagement() {
  const sessionId = "user_456";
  
  // Simulate a conversation
  const queries = [
    "What is hypertension?",
    "What are the symptoms?",
    "How is it treated?",
    "What medications are used?"
  ];
  
  let conversationHistory: any[] = [];
  
  for (const query of queries) {
    const context = await retrieveContext(query, conversationHistory);
    ragContextManager.addRAGContext(sessionId, context);
    
    // Simulate assistant response
    conversationHistory.push(
      { role: "user", content: query },
      { role: "assistant", content: "Based on medical guidelines..." }
    );
    
    // Get accumulated context
    const relevantContext = ragContextManager.getRelevantContext(sessionId, query);
    console.log(`\nQuery: ${query}`);
    console.log(`Relevant entities: ${relevantContext.relevantEntities.join(", ")}`);
    console.log(`Retrieved docs: ${relevantContext.retrievedDocs.length}`);
  }
  
  // Check if context needs refresh
  const needsRefresh = ragContextManager.shouldRefreshContext(sessionId);
  console.log(`\nContext needs refresh: ${needsRefresh}`);
}

// ============================================
// Example 7: Error Handling
// ============================================

export async function exampleErrorHandling() {
  try {
    const context = await retrieveContext("test query", []);
    
    if (context.retrievedDocs.length === 0) {
      console.log("No relevant documents found. Using general knowledge.");
      // Fallback to direct DeepSeek call without RAG
    } else {
      console.log(`Using ${context.retrievedDocs.length} retrieved documents`);
      // Proceed with RAG-enhanced response
    }
  } catch (error: any) {
    console.error("RAG retrieval failed:", error.message);
    // Fallback gracefully
  }
}

// ============================================
// Run Examples (for testing)
// ============================================

async function runExamples() {
  console.log("=== RAG Usage Examples ===\n");
  
  // Uncomment to run specific examples:
  // await exampleBasicQuery();
  // await exampleMultiTurnConversation();
  // await exampleFilteredRetrieval();
  // await exampleIndexing();
  // await exampleChunking();
  // await exampleContextManagement();
  // await exampleErrorHandling();
}

// runExamples();

