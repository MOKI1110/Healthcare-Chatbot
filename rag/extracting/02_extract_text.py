# 02_extract_text.py
import os
from pathlib import Path

import pdfplumber
from bs4 import BeautifulSoup
from tqdm import tqdm

# This file is in rag/extracting/, so go up one level to rag/
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

RAW_DIR = os.path.join(BASE_DIR, "data_raw")
TEXT_DIR = os.path.join(BASE_DIR, "data_text")


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def extract_html_to_txt(in_path: Path, out_path: Path):
    with open(in_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")

    # Remove unnecessary tags
    for tag in soup(["script", "style", "nav", "header", "footer"]):
        tag.decompose()

    # Extract clean text
    text = soup.get_text(separator="\n")
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)


def extract_pdf_to_txt(in_path: Path, out_path: Path):
    try:
        with pdfplumber.open(in_path) as pdf:
            pages = [p.extract_text() or "" for p in pdf.pages]
    except Exception as e:
        print(f"[PDF ERROR] {in_path}: {e}")
        return

    text = "\n".join(pages)
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)


def main():
    ensure_dir(TEXT_DIR)

    for root, _, files in os.walk(RAW_DIR):
        for fname in tqdm(files, desc=f"Extracting in {root}"):
            in_path = Path(root) / fname
            rel = in_path.relative_to(RAW_DIR)

            out_root = Path(TEXT_DIR) / rel.parent
            out_path = out_root / (in_path.stem + ".txt")

            # Skip if already processed
            if out_path.exists():
                continue

            lower = fname.lower()

            if lower.endswith(".html") or lower.endswith(".htm"):
                extract_html_to_txt(in_path, out_path)

            elif lower.endswith(".pdf"):
                extract_pdf_to_txt(in_path, out_path)

            # Everything else is ignored


if __name__ == "__main__":
    main()
