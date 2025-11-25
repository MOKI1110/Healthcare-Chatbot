# 03_clean_and_chunk.py
import os
import uuid
from pathlib import Path

import ujson as json
from tqdm import tqdm

BASE_DIR = os.path.dirname(__file__)
TEXT_DIR = os.path.join(BASE_DIR, "data_text")
CHUNK_DIR = os.path.join(BASE_DIR, "data_chunks")
CHUNK_PATH = os.path.join(CHUNK_DIR, "chunks.jsonl")

MAX_TOKENS = 400
OVERLAP = 80

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def clean_text(txt: str) -> str:
    lines = [l.strip() for l in txt.splitlines()]
    lines = [l for l in lines if l]
    return "\n".join(lines)

def chunk_text(text: str, max_tokens: int = MAX_TOKENS, overlap: int = OVERLAP):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + max_tokens, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start = end - overlap
    return chunks

def infer_language_from_path(path: Path) -> str:
    # Very simple heuristic — you can refine later:
    parts = [p.lower() for p in path.parts]
    if "tamil" in parts or "ta" in parts:
        return "ta"
    if "hindi" in parts or "hi" in parts:
        return "hi"
    return "en"

def main():
    ensure_dir(CHUNK_DIR)
    with open(CHUNK_PATH, "w", encoding="utf-8") as out_f:
        for root, _, files in os.walk(TEXT_DIR):
            for fname in tqdm(files, desc=f"Chunking in {root}"):
                if not fname.endswith(".txt"):
                    continue
                in_path = Path(root) / fname
                with open(in_path, "r", encoding="utf-8", errors="ignore") as f:
                    txt = f.read()
                txt = clean_text(txt)
                if not txt.strip():
                    continue

                rel = in_path.relative_to(TEXT_DIR)
                source = str(rel)
                language = infer_language_from_path(rel)

                chunks = chunk_text(txt)
                for i, ch in enumerate(chunks):
                    record = {
                        "id": str(uuid.uuid4()),
                        "source": source,
                        "chunk_index": i,
                        "language": language,
                        "text": ch
                    }
                    out_f.write(json.dumps(record, ensure_ascii=False) + "\n")

if __name__ == "__main__":
    main()
