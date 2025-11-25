# 01_download_scrape_medicineline_drugs.py
"""
Scrape MedlinePlus drug information pages (A–Z + 0-9) into:
    data_raw/medlineplus_drugs/

Run with:
    (venv) python 01_download_scrape_medicineline_drugs.py
"""

import os
import time
import string
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from tqdm import tqdm

# ---------- basic setup ----------

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "health-rag-meds/0.1 (research; contact: you@example.com)"
})

BASE_DIR = os.path.dirname(__file__)
RAW_DIR = os.path.join(BASE_DIR, "data_raw", "medlineplus_drugs")


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def safe_filename(url: str) -> str:
    name = url.replace("https://", "").replace("http://", "")
    name = name.replace("/", "_").replace("?", "_").replace("&", "_")
    if not name.endswith(".html"):
        name += ".html"
    return name


def fetch(url: str) -> str | None:
    """Return HTML text or None on error."""
    try:
        resp = SESSION.get(url, timeout=20)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        print(f"[ERROR] fetching {url}: {e}")
        return None


# ---------- drug page discovery ----------

def drug_letter_url(letter: str) -> str:
    """
    Build the URL for the 'Drugs:' index for a given letter.

    Examples:
      A    -> https://medlineplus.gov/druginfo/drug_Aa.html
      0-9  -> https://medlineplus.gov/druginfo/drug_00.html
    """
    if letter == "0-9":
        return "https://medlineplus.gov/druginfo/drug_00.html"
    return f"https://medlineplus.gov/druginfo/drug_{letter}a.html"


def get_drug_links_from_letter(letter_url: str):
    """
    Extract all drug info links from one letter page.

    Strategy:
      1. Fetch the letter index page (e.g., drug_Aa.html).
      2. Collect all <a> tags.
      3. Normalize each href to a full URL using that page as the base.
      4. Keep only URLs that contain '/druginfo/meds/'.
    """
    html = fetch(letter_url)
    if not html:
        print(f"  [DEBUG] No HTML for {letter_url}")
        return []

    soup = BeautifulSoup(html, "html.parser")

    a_tags = soup.find_all("a", href=True)
    print(f"  [DEBUG] {letter_url} has {len(a_tags)} <a> tags")

    links: set[str] = set()

    for a in a_tags:
        href = a["href"]

        # Build a full URL relative to the letter page
        full_url = urljoin(letter_url, href)

        # Normalize to lowercase for matching
        normalized = full_url.lower()

        # MedlinePlus drug monograph pages live under /druginfo/meds/
        if "/druginfo/meds/" in normalized:
            links.add(full_url)

    # Debug: show a few sample hrefs (first 5)
    print("  [DEBUG] Sample hrefs from this page:")
    for a in a_tags[:5]:
        print("    ", a["href"])

    print(f"  [DEBUG] Found {len(links)} drug info links on this page\n")

    return sorted(links)


# ---------- main crawl ----------

def crawl_medlineplus_drugs():
    print("\n[MedlinePlus Drugs] Starting scrape...\n")

    ensure_dir(RAW_DIR)

    letters = list(string.ascii_uppercase) + ["0-9"]
    all_drug_pages: set[str] = set()

    # 1) Collect all drug article URLs from A–Z + 0–9
    for letter in letters:
        url = drug_letter_url(letter)
        print(f"[MedlinePlus Drugs] Letter {letter} -> {url}")
        links = get_drug_links_from_letter(url)
        print(f"[MedlinePlus Drugs] Letter {letter}: {len(links)} links added\n")
        all_drug_pages.update(links)
        time.sleep(0.3)  # be polite to the server

    print(f"[MedlinePlus Drugs] Total unique drug article pages: {len(all_drug_pages)}")

    # 2) Download each drug article page
    for url in tqdm(sorted(all_drug_pages), desc="Downloading drug pages"):
        html = fetch(url)
        if not html:
            continue

        filename = safe_filename(url)
        out_path = os.path.join(RAW_DIR, filename)

        # Skip if already downloaded
        if os.path.exists(out_path):
            # print(f"[SKIP] {filename}")
            continue

        with open(out_path, "w", encoding="utf-8", errors="ignore") as f:
            f.write(html)

    print("\n[MedlinePlus Drugs] Completed scrape!")


if __name__ == "__main__":
    crawl_medlineplus_drugs()
