# RAG Quick Start Guide

## Overview

Your healthcare chatbot now has a complete RAG (Retrieval-Augmented Generation) system integrated with DeepSeek. This enables:

✅ **Context-aware responses** from medical knowledge bases  
✅ **Reduced hallucinations** by grounding responses in retrieved data  
✅ **Multi-turn conversation** context management  
✅ **Optimized retrieval** for healthcare terminology  

## Quick Setup

### 1. Environment Variables

Ensure your `.env` file has:
```env
OPENROUTER_API_KEY=your_key_here
RAG_ENABLED=true
RAG_TOP_K=5
RAG_SIMILARITY_THRESHOLD=0.3
```

### 2. Initialize RAG System

The RAG system will automatically initialize when you start the server. To manually index documents:

```typescript
import { initializeRAGSystem } from "./utils/documentIndexer";

await initializeRAGSystem();
```

Or run the initialization script:
```bash
ts-node src/scripts/initializeRAG.ts
```

### 3. Index Your Medical Documents

```typescript
import { indexDocuments } from "./services/ragService";

await indexDocuments([
  {
    content: "Your medical document content here...",
    metadata: {
      source: "guidelines_2024",
      documentType: "guideline",
      section: "cardiovascular"
    }
  }
]);
```

## How It Works

### Request Flow

1. **User sends message** → `POST /api/chat`
2. **RAG retrieves context** → Searches vector store for relevant documents
3. **Context formatted** → Retrieved docs added to system prompt
4. **DeepSeek generates** → Response based on retrieved context + conversation history
5. **Response returned** → Grounded in medical knowledge

### Example Request

```json
POST /api/chat
{
  "message": "What are the symptoms of diabetes?",
  "sessionId": "user_123",
  "conversationHistory": []
}
```

### Example Response

The chatbot will:
1. Retrieve relevant diabetes documents from your knowledge base
2. Format them in the system prompt
3. Generate a response using DeepSeek that cites the retrieved information

## Key Features

### 1. Automatic Context Retrieval

Every message automatically triggers RAG retrieval:

```typescript
// In chatbotService.ts - already integrated!
const ragContext = await retrieveContext(message, conversationHistory);
```

### 2. Multi-Turn Conversation Support

Context is maintained across conversations:

```typescript
// First message
"Tell me about hypertension"
// System retrieves hypertension docs

// Follow-up
"What are the symptoms?"
// System uses previous context + retrieves symptom-specific docs
```

### 3. Filtered Retrieval

Retrieve specific document types:

```typescript
// Only guidelines
const context = await retrieveContext(query, history, {
  documentType: "guideline",
  topK: 3
});
```

### 4. Hallucination Prevention

The system prompt explicitly instructs DeepSeek to:
- Base responses on retrieved information
- Not make up information
- Cite sources when available
- Acknowledge uncertainty

## Configuration

### Tuning Retrieval

Edit `backend/src/services/ragService.ts`:

```typescript
const MAX_CHUNK_SIZE = 500;        // Document chunk size
const CHUNK_OVERLAP = 50;         // Overlap between chunks
const TOP_K = 5;                  // Documents to retrieve
const SIMILARITY_THRESHOLD = 0.3; // Minimum similarity score
```

### Tuning Context Management

Edit `backend/src/services/ragContextManager.ts`:

```typescript
const MAX_CONTEXTS_PER_SESSION = 10;  // Contexts to remember
const CONTEXT_TTL = 30 * 60 * 1000;   // 30 minutes
```

## Best Practices

### 1. Document Preparation

- **Chunk size**: 400-600 characters for medical documents
- **Metadata**: Include source, type, and section
- **Quality**: Use verified medical sources only

### 2. Query Optimization

- The system automatically reformulates queries with conversation context
- Medical terminology is preserved in embeddings
- Recent conversation history enhances retrieval

### 3. Performance

- **Small datasets** (<10K docs): Current in-memory store is fine
- **Large datasets** (>100K docs): Consider ChromaDB, Pinecone, or Weaviate
- **Caching**: Embeddings are generated once per document

### 4. Monitoring

Watch for:
- Retrieval latency (should be <500ms)
- Similarity scores (aim for >0.4 for good matches)
- Fallback frequency (if RAG fails often)

## Troubleshooting

### No Documents Retrieved

**Problem**: `retrievedDocs.length === 0`

**Solutions**:
1. Check if documents are indexed: `vectorStore.getDocuments().length`
2. Lower similarity threshold: `threshold: 0.2`
3. Verify embeddings are generated correctly

### Low Quality Retrievals

**Problem**: Retrieved documents don't match query

**Solutions**:
1. Improve document chunking (preserve context)
2. Add more relevant documents to knowledge base
3. Adjust query reformulation logic

### Slow Performance

**Problem**: Retrieval takes >1 second

**Solutions**:
1. Reduce `topK` parameter
2. Use document type filters
3. Consider vector database for large datasets

## Next Steps

1. **Index your medical documents** using `indexDocuments()`
2. **Test queries** to verify retrieval quality
3. **Monitor performance** and adjust parameters
4. **Scale up** with vector database if needed

## Support

For detailed documentation, see:
- `RAG_INTEGRATION.md` - Complete integration guide
- `src/examples/ragUsageExamples.ts` - Code examples
- `src/services/ragService.ts` - Service implementation

---

**Your RAG system is ready to use!** 🚀

The chatbot will automatically use RAG for all queries. No additional code changes needed in your routes or frontend.

