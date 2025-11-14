/**
 * RAG Context Manager
 * 
 * Manages conversation context and prevents context drift in multi-turn conversations
 */

import { RAGContext, RetrievalResult } from "./ragService";

// ============================================
// Types
// ============================================

export interface ConversationContext {
  sessionId: string;
  ragContexts: RAGContext[];
  currentTopic?: string;
  relevantEntities: string[]; // Medical terms, conditions, etc.
  lastRetrievalTime: string;
}

// ============================================
// Context Manager
// ============================================

class RAGContextManager {
  private contexts: Map<string, ConversationContext> = new Map();
  private readonly MAX_CONTEXTS_PER_SESSION = 10;
  private readonly CONTEXT_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Get or create conversation context for a session
   */
  getContext(sessionId: string): ConversationContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        ragContexts: [],
        relevantEntities: [],
        lastRetrievalTime: new Date().toISOString(),
      });
    }
    return this.contexts.get(sessionId)!;
  }

  /**
   * Add RAG context to conversation
   */
  addRAGContext(sessionId: string, ragContext: RAGContext): void {
    const context = this.getContext(sessionId);
    
    // Add to contexts list
    context.ragContexts.push(ragContext);
    
    // Keep only recent contexts
    if (context.ragContexts.length > this.MAX_CONTEXTS_PER_SESSION) {
      context.ragContexts.shift();
    }
    
    // Update last retrieval time
    context.lastRetrievalTime = new Date().toISOString();
    
    // Extract relevant entities from retrieved docs
    this.extractEntities(context, ragContext);
  }

  /**
   * Get relevant context for current query
   */
  getRelevantContext(
    sessionId: string,
    currentQuery: string
  ): {
    retrievedDocs: RetrievalResult[];
    conversationSummary: string;
    relevantEntities: string[];
  } {
    const context = this.getContext(sessionId);
    
    // Combine all retrieved docs from recent contexts
    const allDocs = new Map<string, RetrievalResult>();
    
    // Add docs from recent RAG contexts (weighted by recency)
    context.ragContexts.forEach((ragCtx, index) => {
      const weight = context.ragContexts.length - index; // More recent = higher weight
      ragCtx.retrievedDocs.forEach(doc => {
        const existing = allDocs.get(doc.chunk.id);
        if (!existing || existing.similarity < doc.similarity * weight) {
          allDocs.set(doc.chunk.id, {
            ...doc,
            similarity: doc.similarity * weight,
          });
        }
      });
    });
    
    // Sort by weighted similarity and take top results
    const relevantDocs = Array.from(allDocs.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    // Generate conversation summary
    const conversationSummary = this.generateConversationSummary(context);
    
    return {
      retrievedDocs: relevantDocs,
      conversationSummary,
      relevantEntities: context.relevantEntities,
    };
  }

  /**
   * Extract medical entities from RAG context
   */
  private extractEntities(
    context: ConversationContext,
    ragContext: RAGContext
  ): void {
    // Simple entity extraction (in production, use NER model)
    const medicalTerms = [
      "symptom", "diagnosis", "treatment", "medication", "disease",
      "condition", "syndrome", "disorder", "infection", "pain",
      "fever", "cough", "headache", "nausea", "fatigue",
    ];
    
    const queryLower = ragContext.query.toLowerCase();
    const newEntities = medicalTerms.filter(term => 
      queryLower.includes(term) && !context.relevantEntities.includes(term)
    );
    
    context.relevantEntities.push(...newEntities);
    
    // Keep only recent entities (last 20)
    if (context.relevantEntities.length > 20) {
      context.relevantEntities = context.relevantEntities.slice(-20);
    }
  }

  /**
   * Generate summary of conversation context
   */
  private generateConversationSummary(context: ConversationContext): string {
    if (context.ragContexts.length === 0) {
      return "No previous context available.";
    }
    
    const recentQueries = context.ragContexts
      .slice(-3)
      .map(ctx => ctx.query)
      .join("; ");
    
    const topics = context.ragContexts
      .slice(-3)
      .flatMap(ctx => 
        ctx.retrievedDocs
          .slice(0, 2)
          .map(doc => doc.chunk.metadata.documentType)
      )
      .filter((v, i, a) => a.indexOf(v) === i); // Unique
    
    return `Previous topics: ${topics.join(", ")}. Recent queries: ${recentQueries}`;
  }

  /**
   * Check if context needs refresh
   */
  shouldRefreshContext(sessionId: string): boolean {
    const context = this.getContext(sessionId);
    const lastRetrieval = new Date(context.lastRetrievalTime).getTime();
    const now = Date.now();
    
    // Refresh if last retrieval was more than 5 minutes ago
    return (now - lastRetrieval) > 5 * 60 * 1000;
  }

  /**
   * Clear context for a session
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  /**
   * Clean up old contexts
   */
  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, context] of this.contexts.entries()) {
      const lastRetrieval = new Date(context.lastRetrievalTime).getTime();
      if (now - lastRetrieval > this.CONTEXT_TTL) {
        this.contexts.delete(sessionId);
      }
    }
  }
}

// Singleton instance
const contextManager = new RAGContextManager();

// Cleanup every 10 minutes
setInterval(() => {
  contextManager.cleanup();
}, 10 * 60 * 1000);

export default contextManager;

