/**
 * RAG Service - Retrieval-Augmented Generation for Healthcare Chatbot
 * 
 * This service handles:
 * - Document chunking and embedding
 * - Vector similarity search
 * - Query reformulation
 * - Context retrieval and ranking
 */

import axios from "axios";
import config from "../config";

// ============================================
// Types & Interfaces
// ============================================

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    page?: number;
    section?: string;
    documentType: "guideline" | "research" | "record" | "general";
    timestamp?: string;
  };
  embedding?: number[];
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  similarity: number;
  rank: number;
}

export interface RAGContext {
  retrievedDocs: RetrievalResult[];
  query: string;
  reformulatedQuery?: string;
  timestamp: string;
}

// ============================================
// Configuration
// ============================================

const EMBEDDING_API_URL = "https://openrouter.ai/api/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small"; // Cost-effective, good quality
const MAX_CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 50; // characters overlap between chunks
const TOP_K = 5; // Number of documents to retrieve
const SIMILARITY_THRESHOLD = 0.3; // Minimum similarity score

// ============================================
// Document Chunking
// ============================================

/**
 * Chunks medical documents intelligently, preserving context
 */
export function chunkDocument(
  content: string,
  metadata: DocumentChunk["metadata"],
  chunkSize: number = MAX_CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Split by paragraphs first (preserve medical document structure)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = "";
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        id: `${metadata.source}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          ...metadata,
          section: `chunk_${chunkIndex}`,
        },
      });
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + "\n\n" + paragraph;
      chunkIndex++;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }
  
  // Add remaining chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${metadata.source}_chunk_${chunkIndex}`,
      content: currentChunk.trim(),
      metadata: {
        ...metadata,
        section: `chunk_${chunkIndex}`,
      },
    });
  }
  
  return chunks;
}

// ============================================
// Embedding Generation
// ============================================

/**
 * Generates embeddings for text using OpenRouter API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = config.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("❌ OPENROUTER_API_KEY missing for embeddings");
  }

  try {
    const response = await axios.post(
      EMBEDDING_API_URL,
      {
        model: EMBEDDING_MODEL,
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const embedding = response.data?.data?.[0]?.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding response");
    }

    return embedding;
  } catch (error: any) {
    console.error("[RAG] Embedding generation failed:", error.message);
    throw error;
  }
}

/**
 * Batch generate embeddings for multiple chunks
 */
export async function embedChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
  const embeddedChunks: DocumentChunk[] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const embeddingPromises = batch.map(chunk => 
      generateEmbedding(chunk.content).then(embedding => ({
        ...chunk,
        embedding,
      }))
    );
    
    const embedded = await Promise.all(embeddingPromises);
    embeddedChunks.push(...embedded);
  }
  
  return embeddedChunks;
}

// ============================================
// Vector Store (In-Memory)
// ============================================

class VectorStore {
  private documents: DocumentChunk[] = [];
  
  /**
   * Add documents to the vector store
   */
  async addDocuments(chunks: DocumentChunk[]): Promise<void> {
    const embedded = await embedChunks(chunks);
    this.documents.push(...embedded);
    console.log(`[RAG] Added ${embedded.length} chunks to vector store (total: ${this.documents.length})`);
  }
  
  /**
   * Search for similar documents using cosine similarity
   */
  async search(
    queryEmbedding: number[],
    topK: number = TOP_K,
    threshold: number = SIMILARITY_THRESHOLD,
    filters?: { documentType?: string; source?: string }
  ): Promise<RetrievalResult[]> {
    if (this.documents.length === 0) {
      return [];
    }
    
    // Calculate cosine similarity for all documents
    const similarities = this.documents
      .map((doc, index) => {
        if (!doc.embedding) return null;
        
        // Apply filters
        if (filters?.documentType && doc.metadata.documentType !== filters.documentType) {
          return null;
        }
        if (filters?.source && doc.metadata.source !== filters.source) {
          return null;
        }
        
        const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
        return {
          chunk: doc,
          similarity,
          rank: index,
        };
      })
      .filter((result): result is RetrievalResult => 
        result !== null && result.similarity >= threshold
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((result, index) => ({
        ...result,
        rank: index + 1,
      }));
    
    return similarities;
  }
  
  /**
   * Get all documents (for debugging)
   */
  getDocuments(): DocumentChunk[] {
    return this.documents;
  }
  
  /**
   * Clear the vector store
   */
  clear(): void {
    this.documents = [];
  }
}

// Singleton instance
const vectorStore = new VectorStore();

// ============================================
// Cosine Similarity Calculation
// ============================================

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

// ============================================
// Query Reformulation
// ============================================

/**
 * Reformulates query to improve retrieval accuracy
 * Expands medical terminology and adds context
 */
export async function reformulateQuery(
  query: string,
  conversationHistory: any[] = []
): Promise<string> {
  // Extract key medical terms from conversation history
  const recentContext = conversationHistory
    .slice(-4) // Last 4 messages
    .map(msg => msg.content)
    .join(" ");
  
  // Combine query with recent context
  const enhancedQuery = recentContext 
    ? `${query}. Context: ${recentContext}`
    : query;
  
  // For now, return enhanced query
  // In production, you could use DeepSeek to reformulate:
  // "Reformulate this medical query for better document retrieval: {query}"
  
  return enhancedQuery;
}

// ============================================
// Main RAG Retrieval Function
// ============================================

/**
 * Retrieves relevant medical documents for a query
 */
export async function retrieveContext(
  query: string,
  conversationHistory: any[] = [],
  options: {
    topK?: number;
    threshold?: number;
    documentType?: string;
    source?: string;
  } = {}
): Promise<RAGContext> {
  try {
    // Check if vector store has documents
    const docCount = vectorStore.getDocuments().length;
    if (docCount === 0) {
      console.log("[RAG] Vector store is empty. No documents indexed yet.");
      return {
        retrievedDocs: [],
        query,
        timestamp: new Date().toISOString(),
      };
    }
    
    // 1. Reformulate query with conversation context
    const reformulatedQuery = await reformulateQuery(query, conversationHistory);
    console.log(`[RAG] Reformulated query: "${reformulatedQuery}"`);
    
    // 2. Generate query embedding
    console.log("[RAG] Generating query embedding...");
    const queryEmbedding = await generateEmbedding(reformulatedQuery);
    
    // 3. Build filters
    const filters: { documentType?: string; source?: string } = {};
    if (options.documentType) filters.documentType = options.documentType;
    if (options.source) filters.source = options.source;
    
    // 4. Search vector store
    console.log(`[RAG] Searching ${docCount} documents in vector store...`);
    const results = await vectorStore.search(
      queryEmbedding,
      options.topK || TOP_K,
      options.threshold || SIMILARITY_THRESHOLD,
      Object.keys(filters).length > 0 ? filters : undefined
    );
    
    console.log(`[RAG] Found ${results.length} relevant documents`);
    
    return {
      retrievedDocs: results,
      query,
      reformulatedQuery,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("[RAG] Retrieval failed:", error.message);
    console.error("[RAG] Error details:", error);
    return {
      retrievedDocs: [],
      query,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// Document Loading & Indexing
// ============================================

/**
 * Load and index documents from various sources
 */
export async function indexDocuments(
  documents: Array<{
    content: string;
    metadata: DocumentChunk["metadata"];
  }>
): Promise<void> {
  const allChunks: DocumentChunk[] = [];
  
  for (const doc of documents) {
    const chunks = chunkDocument(doc.content, doc.metadata);
    allChunks.push(...chunks);
  }
  
  await vectorStore.addDocuments(allChunks);
  console.log(`[RAG] Indexed ${documents.length} documents into ${allChunks.length} chunks`);
}

/**
 * Load documents from CSV (for healthcare dataset)
 */
export async function loadDocumentsFromCSV(
  csvPath: string,
  questionColumn: string = "question",
  answerColumn: string = "answer"
): Promise<void> {
  // This would require a CSV parser
  // For now, we'll provide the structure
  // In production, use: const csv = require('csv-parser');
  console.log(`[RAG] CSV loading not implemented. Use indexDocuments() instead.`);
}

// ============================================
// Exports
// ============================================

export { vectorStore };
export default {
  retrieveContext,
  indexDocuments,
  chunkDocument,
  embedChunks,
  reformulateQuery,
  vectorStore,
};

