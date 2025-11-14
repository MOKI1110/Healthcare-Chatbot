# RAG Integration Guide for Healthcare Chatbot

## Overview

This document describes the Retrieval-Augmented Generation (RAG) system integrated with DeepSeek for the healthcare chatbot. The RAG system enhances response accuracy by retrieving relevant medical information from knowledge bases before generating responses.

## Architecture

```
User Query
    ↓
Query Reformulation (with conversation context)
    ↓
Vector Embedding Generation
    ↓
Similarity Search in Vector Store
    ↓
Retrieve Top-K Relevant Documents
    ↓
Context Management (prevent drift)
    ↓
Format Context for DeepSeek
    ↓
DeepSeek Generation (with retrieved context)
    ↓
Response to User
```

## Key Components

### 1. RAG Service (`ragService.ts`)

**Features:**
- Document chunking with overlap preservation
- Embedding generation using OpenRouter API
- Vector similarity search (cosine similarity)
- Query reformulation with conversation context
- Configurable retrieval parameters

**Key Functions:**
- `chunkDocument()` - Intelligently chunks medical documents
- `embedChunks()` - Generates embeddings for document chunks
- `retrieveContext()` - Main retrieval function
- `reformulateQuery()` - Enhances queries with context

### 2. Context Manager (`ragContextManager.ts`)

**Features:**
- Manages conversation context across multiple turns
- Prevents context drift
- Extracts relevant medical entities
- Generates conversation summaries
- Automatic cleanup of old contexts

**Key Functions:**
- `addRAGContext()` - Stores retrieved context
- `getRelevantContext()` - Retrieves relevant context for current query
- `shouldRefreshContext()` - Determines if context needs refresh

### 3. Document Indexer (`documentIndexer.ts`)

**Features:**
- Loads healthcare datasets from CSV
- Indexes medical guidelines
- Batch processing for large datasets
- Metadata management

## Best Practices

### 1. Document Chunking

**Optimal Chunk Size:**
- **500 characters** - Good balance for medical documents
- **50 character overlap** - Preserves context across chunks
- **Paragraph-based splitting** - Maintains document structure

**Example:**
```typescript
const chunks = chunkDocument(medicalText, {
  source: "guidelines.pdf",
  documentType: "guideline",
  section: "cardiovascular"
});
```

### 2. Embedding Strategy

**Model Selection:**
- `text-embedding-3-small` - Cost-effective, good quality
- Batch processing (10 chunks at a time) - Avoids rate limits
- Cache embeddings when possible

**Healthcare-Specific Considerations:**
- Medical terminology is preserved in embeddings
- Abbreviations are handled naturally
- Multi-language support via OpenRouter

### 3. Query Reformulation

**Strategies:**
1. **Context Expansion**: Add recent conversation history
2. **Entity Extraction**: Identify medical terms and conditions
3. **Query Expansion**: Add synonyms and related terms (future enhancement)

**Example:**
```typescript
const reformulated = await reformulateQuery(
  "What causes chest pain?",
  conversationHistory // Last 4 messages
);
```

### 4. Retrieval Optimization

**Parameters:**
- `topK: 5` - Optimal number of documents
- `threshold: 0.3` - Minimum similarity score
- `documentType` filter - Filter by guideline/research/record

**Performance:**
- In-memory vector store for <100K documents
- For larger datasets, consider ChromaDB, Pinecone, or Weaviate

### 5. Context Management

**Multi-Turn Conversations:**
- Store last 10 RAG contexts per session
- Weight recent contexts higher
- Extract and track medical entities
- Generate conversation summaries

**Preventing Context Drift:**
- Refresh context every 5 minutes
- Track conversation topics
- Maintain entity consistency

## Integration with DeepSeek

### System Prompt Enhancement

The system prompt is dynamically enhanced with retrieved context:

```typescript
const systemPrompt = buildSystemPrompt(ragContext);
```

**Context Format:**
```
### 📚 Relevant Medical Information
[Reference 1] (Source: guidelines.pdf, Type: guideline, Relevance: 85.2%)
[Document content...]

### ⚠️ Critical Instructions
- Base your response primarily on the retrieved information
- DO NOT make up or hallucinate information
- Cite sources when using retrieved context
```

### Response Generation

DeepSeek receives:
1. **System Prompt** - Base instructions + retrieved context
2. **Conversation History** - Previous messages
3. **Current Query** - Enhanced with conversation context

**Hallucination Prevention:**
- Explicit instructions to use retrieved context
- Similarity scores shown to model
- Source citations required
- Uncertainty acknowledgment

## Usage Examples

### Basic Retrieval

```typescript
import { retrieveContext } from "./services/ragService";

const context = await retrieveContext(
  "What are the symptoms of diabetes?",
  conversationHistory
);

console.log(`Retrieved ${context.retrievedDocs.length} documents`);
```

### Filtered Retrieval

```typescript
// Retrieve only guidelines
const context = await retrieveContext(
  "Hypertension treatment",
  conversationHistory,
  {
    documentType: "guideline",
    topK: 3
  }
);
```

### Document Indexing

```typescript
import { indexDocuments } from "./services/ragService";

await indexDocuments([
  {
    content: "Medical guideline content...",
    metadata: {
      source: "who_guidelines_2024",
      documentType: "guideline",
      section: "infectious_diseases"
    }
  }
]);
```

## Configuration

### Environment Variables

```env
OPENROUTER_API_KEY=your_key_here  # Required for embeddings
```

### Tuning Parameters

In `ragService.ts`:
```typescript
const MAX_CHUNK_SIZE = 500;        // Characters per chunk
const CHUNK_OVERLAP = 50;          // Overlap between chunks
const TOP_K = 5;                  // Documents to retrieve
const SIMILARITY_THRESHOLD = 0.3;  // Minimum similarity
```

## Performance Optimization

### 1. Caching
- Cache embeddings for frequently accessed documents
- Store query embeddings for similar queries

### 2. Batch Processing
- Process documents in batches of 10
- Use async/await for parallel embedding generation

### 3. Vector Store
- **Current**: In-memory (suitable for <100K documents)
- **Production**: Consider ChromaDB, Pinecone, or Weaviate

### 4. Query Optimization
- Pre-filter by document type when possible
- Use approximate nearest neighbor search for large datasets

## Error Handling

The system gracefully handles failures:

```typescript
try {
  const context = await retrieveContext(query, history);
  // Use context
} catch (error) {
  // Fallback to direct DeepSeek call
  return await callWithFallback(message, conversationHistory);
}
```

## Monitoring

**Key Metrics:**
- Retrieval latency
- Similarity scores distribution
- Context hit rate
- Fallback frequency

**Logging:**
```typescript
console.log(`[RAG] Retrieved ${results.length} documents`);
console.log(`[RAG] Top similarity: ${results[0]?.similarity}`);
```

## Future Enhancements

1. **Hybrid Search**: Combine semantic + keyword search
2. **Reranking**: Use cross-encoder for better ranking
3. **Query Expansion**: Medical terminology expansion
4. **Multi-Modal RAG**: Support for medical images
5. **Citation Generation**: Automatic source citations
6. **Confidence Scoring**: Model confidence in retrieved context

## Troubleshooting

### Low Retrieval Quality
- Check similarity threshold (may be too high)
- Verify document embeddings are generated correctly
- Review query reformulation logic

### Slow Performance
- Reduce `topK` parameter
- Use batch processing for embeddings
- Consider vector database for large datasets

### Context Drift
- Adjust context refresh interval
- Increase context window size
- Improve entity extraction

## References

- [RAG Paper](https://arxiv.org/abs/2005.11401)
- [Vector Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [ChromaDB Documentation](https://www.trychroma.com/)

