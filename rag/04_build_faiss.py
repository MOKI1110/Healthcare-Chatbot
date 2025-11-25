# 04_build_faiss.py
import os

import faiss
import numpy as np
import ujson as json
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(__file__)
CHUNK_PATH = os.path.join(BASE_DIR, "data_chunks", "chunks.jsonl")
INDEX_DIR = os.path.join(BASE_DIR, "faiss_index")
INDEX_PATH = os.path.join(INDEX_DIR, "index.faiss")
META_PATH = os.path.join(INDEX_DIR, "meta.jsonl")

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def load_chunks(limit: int | None = None):
    chunks = []
    with open(CHUNK_PATH, "r", encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            chunks.append(rec)
            if limit and len(chunks) >= limit:
                break
    return chunks

def build_index():
    ensure_dir(INDEX_DIR)

    print("[*] Loading chunks...")
    chunks = load_chunks()
    texts = [c["text"] for c in chunks]

    print(f"[*] Loaded {len(texts)} chunks")

    print("[*] Loading embedding model...")
    model = SentenceTransformer(MODEL_NAME)

    print("[*] Embedding chunks...")
    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True  # for cosine similarity
    )

    d = embeddings.shape[1]
    index = faiss.IndexFlatIP(d)  # inner product for cosine if normalized
    index.add(embeddings)

    print(f"[*] Index has {index.ntotal} vectors")

    print("[*] Saving index and metadata...")
    faiss.write_index(index, INDEX_PATH)

    with open(META_PATH, "w", encoding="utf-8") as f:
        for rec in chunks:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print("[*] Done.")

def search(query: str, top_k: int = 5):
    """Simple test search (run after building)."""
    from sentence_transformers import SentenceTransformer

    print("[*] Loading index and model...")
    index = faiss.read_index(INDEX_PATH)
    model = SentenceTransformer(MODEL_NAME)

    q_emb = model.encode([query], normalize_embeddings=True)
    D, I = index.search(q_emb, top_k)

    # load metadata lines into memory (for demo; for very large corpora use random access)
    meta = []
    with open(META_PATH, "r", encoding="utf-8") as f:
        for line in f:
            meta.append(json.loads(line))

    print("\n=== RESULTS ===")
    for rank, (score, idx) in enumerate(zip(D[0], I[0]), start=1):
        rec = meta[idx]
        print(f"\n[{rank}] score={float(score):.4f}")
        print(f"source: {rec['source']}  (chunk {rec['chunk_index']})")
        snippet = rec["text"][:400].replace("\n", " ")
        print(f"text: {snippet}...")

if __name__ == "__main__":
    # Step 1: build index
    build_index()

    # Step 2: quick manual test
    # Example: "fever when to see a doctor"
    # search("fever when to see a doctor")
