# How to Activate and Verify RAG

## ✅ What I Just Fixed

1. **Automatic RAG Initialization** - RAG now initializes automatically when the server starts
2. **Sample Documents** - Added 3 sample medical documents (diabetes, hypertension, cold/flu) so RAG has content to retrieve
3. **Better Logging** - Added detailed logs to show when RAG is active and what it's doing
4. **RAG Status Endpoint** - Added `/api/rag/status` to check RAG status
5. **DeepSeek Logging** - Better logging to see why it might be falling back to LLaMA

## 🚀 How to Activate RAG

### Step 1: Restart Your Server

Simply restart your backend server. RAG will automatically:
- Initialize on startup
- Load sample medical documents if vector store is empty
- Be ready to use immediately

```bash
cd backend
npm run dev
```

You should see logs like:
```
🚀 Initializing RAG system...
📚 Vector store is empty. Adding sample medical documents...
[RAG] Added X chunks to vector store (total: X)
✅ Sample medical documents indexed successfully!
✅ RAG system ready with X document chunks indexed
```

### Step 2: Verify RAG is Active

Check RAG status:
```bash
curl http://localhost:4000/api/rag/status
```

Or visit in browser: `http://localhost:4000/api/rag/status`

You should see:
```json
{
  "enabled": true,
  "documentCount": 3,
  "status": "active",
  "message": "RAG is active with 3 document chunks indexed"
}
```

### Step 3: Test a Query

Send a test message and watch the console logs. You should see:

```
[RAG] Retrieving context for query...
[RAG] Reformulated query: "..."
[RAG] Generating query embedding...
[RAG] Searching 3 documents in vector store...
[RAG] Found X relevant documents
[RAG] Doc 1: diabetes_guidelines (similarity: XX.X%)
[RAG] Calling DeepSeek with retrieved context...
[Model] Attempting DeepSeek (deepseek/deepseek-chat-v3.1:free) with RAG context...
```

## 🔍 Troubleshooting

### Problem: Still seeing LLaMA responses

**Check 1: Is DeepSeek failing?**
Look for logs like:
```
[⚠️ DeepSeek failed — Status: 429, Message: Rate limit exceeded]
```

**Solution**: DeepSeek free tier has rate limits. Wait a few minutes or check your OpenRouter API key.

**Check 2: Is RAG enabled?**
```bash
curl http://localhost:4000/api/rag/status
```

If `enabled: false`, set in `.env`:
```env
RAG_ENABLED=true
```

**Check 3: Are documents indexed?**
If `documentCount: 0`, RAG won't retrieve anything. The server should auto-add sample docs, but you can manually add:

```bash
curl -X POST http://localhost:4000/api/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [{
      "content": "Your medical content here...",
      "metadata": {
        "source": "my_guidelines",
        "documentType": "guideline",
        "section": "general"
      }
    }]
  }'
```

### Problem: No RAG logs appearing

**Check**: Is RAG actually being called?

Look for these logs when you send a message:
- `[RAG] Retrieving context for query...`
- `[RAG] Retrieved X relevant documents`

If you don't see these, RAG might be disabled or failing silently.

**Solution**: Check your `.env` file:
```env
RAG_ENABLED=true
```

### Problem: RAG retrieves 0 documents

**Possible causes:**
1. Vector store is empty (check status endpoint)
2. Query doesn't match any documents (try different keywords)
3. Similarity threshold too high (default: 0.3)

**Solution**: Lower the threshold or add more documents:
```env
RAG_SIMILARITY_THRESHOLD=0.2
```

## 📊 Understanding the Logs

### When RAG is Working:
```
[RAG] Retrieving context for query...
[RAG] Reformulated query: "What are diabetes symptoms? Context: ..."
[RAG] Generating query embedding...
[RAG] Searching 3 documents in vector store...
[RAG] Found 2 relevant documents
[RAG] Doc 1: diabetes_guidelines (similarity: 85.2%)
[RAG] Doc 2: hypertension_guidelines (similarity: 45.1%)
[RAG] Calling DeepSeek with retrieved context...
[Model] Attempting DeepSeek (deepseek/deepseek-chat-v3.1:free) with RAG context...
```

### When RAG is Empty:
```
[RAG] Vector store is empty. No documents indexed yet.
[RAG] Retrieved 0 relevant documents
[RAG] No documents retrieved - vector store may be empty or query doesn't match
```

### When DeepSeek Fails (falling back to LLaMA):
```
[Model] Attempting DeepSeek (deepseek/deepseek-chat-v3.1:free) with RAG context...
[⚠️ DeepSeek failed — Status: 429, Message: Rate limit exceeded]
[⚠️ Switching to LLaMA backup model]
[Model] Attempting LLaMA (meta-llama/llama-3.3-8b-instruct:free) with RAG context...
```

**Note**: Even when falling back to LLaMA, RAG context is still passed! So you still get RAG benefits.

## 🎯 Quick Test

Try these queries to test RAG:

1. **"What are the symptoms of diabetes?"**
   - Should retrieve diabetes_guidelines
   - Should show similarity score > 0.5

2. **"How do I manage high blood pressure?"**
   - Should retrieve hypertension_guidelines
   - Should show similarity score > 0.5

3. **"What should I do for a cold?"**
   - Should retrieve respiratory_care
   - Should show similarity score > 0.5

## 📝 Next Steps

1. **Add Your Own Documents**: Use the `/api/rag/index` endpoint to add your medical documents
2. **Monitor Performance**: Watch the similarity scores - aim for > 0.4 for good matches
3. **Tune Parameters**: Adjust `RAG_TOP_K` and `RAG_SIMILARITY_THRESHOLD` in `.env` if needed

## ✅ Success Indicators

You'll know RAG is working when:
- ✅ Server logs show "RAG system ready with X document chunks indexed"
- ✅ Status endpoint shows `"status": "active"` and `documentCount > 0`
- ✅ Query logs show "[RAG] Found X relevant documents"
- ✅ Similarity scores appear in logs
- ✅ DeepSeek is called "with RAG context"

---

**RAG is now active!** 🎉 

The system will automatically use RAG for all queries. If DeepSeek fails and falls back to LLaMA, RAG context is still passed, so you still get the benefits of retrieved medical knowledge.

