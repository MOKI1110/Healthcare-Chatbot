# 01_download_scrape.py
import os
import time
import urllib.parse as up
from typing import List, Set

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "health-rag-bot/0.1 (research; contact: you@example.com)"
})

BASE_DIR = os.path.dirname(__file__)
RAW_DIR = os.path.join(BASE_DIR, "data_raw")

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def safe_filename(url: str) -> str:
    parsed = up.urlparse(url)
    # remove query, keep path, replace / with _
    name = (parsed.netloc + parsed.path).replace("/", "_")
    if not name:
        name = "index"
    if not name.endswith(".html") and not name.endswith(".pdf"):
        name += ".html"
    return name

def fetch(url: str, binary: bool = False, sleep: float = 0.5):
    try:
        resp = SESSION.get(url, timeout=20)
        time.sleep(sleep)
        resp.raise_for_status()
        return resp.content if binary else resp.text
    except Exception as e:
        print(f"[ERROR] fetching {url}: {e}")
        return None

def save_file(folder: str, filename: str, content: bytes | str, binary: bool):
    ensure_dir(folder)
    mode = "wb" if binary else "w"
    kwargs = {} if binary else {"encoding": "utf-8", "errors": "ignore"}
    path = os.path.join(folder, filename)
    with open(path, mode, **kwargs) as f:
        f.write(content)
    return path

def get_links(index_url: str,
              domain_filter: str | None = None,
              href_contains: List[str] | None = None) -> Set[str]:
    html = fetch(index_url)
    if html is None:
        return set()
    soup = BeautifulSoup(html, "html.parser")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("#"):
            continue
        full = up.urljoin(index_url, href)
        if domain_filter and domain_filter not in full:
            continue
        if href_contains:
            if not any(s in full for s in href_contains):
                continue
        links.add(full)
    return links

# -------- WHO --------

WHO_FACT_INDEX = "https://www.who.int/news-room/fact-sheets"
WHO_HEALTH_TOPICS_INDEX = "https://www.who.int/health-topics"

def crawl_who():
    out_dir = os.path.join(RAW_DIR, "who")
    ensure_dir(out_dir)

    # 1) Grab all fact sheet links
    fact_links = get_links(
        WHO_FACT_INDEX,
        domain_filter="who.int",
        href_contains=["/news-room/fact-sheets"]
    )

    # 2) Health topics index (many link to detailed pages)
    topic_links = get_links(
        WHO_HEALTH_TOPICS_INDEX,
        domain_filter="who.int",
        href_contains=["/health-topics/"]
    )

    all_links = fact_links | topic_links
    print(f"[WHO] found {len(all_links)} pages")

    for url in tqdm(sorted(all_links), desc="WHO pages"):
        html = fetch(url)
        if not html:
            continue
        fname = safe_filename(url)
        save_file(out_dir, fname, html, binary=False)

# -------- CDC --------

CDC_HEALTH_TOPICS_INDEX = "https://www.cdc.gov/health-topics.html"  # topics A–Z:contentReference[oaicite:4]{index=4}

def crawl_cdc():
    out_dir = os.path.join(RAW_DIR, "cdc")
    ensure_dir(out_dir)

    topic_links = get_links(
        CDC_HEALTH_TOPICS_INDEX,
        domain_filter="cdc.gov",
        href_contains=["/diseases", "/conditions", "/topic", "/health"]
    )

    print(f"[CDC] found {len(topic_links)} pages")

    for url in tqdm(sorted(topic_links), desc="CDC pages"):
        html = fetch(url)
        if not html:
            continue
        fname = safe_filename(url)
        save_file(out_dir, fname, html, binary=False)

# -------- MedlinePlus --------

MEDLINE_HEALTH_TOPICS = "https://medlineplus.gov/healthtopics.html"  # A–Z topics:contentReference[oaicite:5]{index=5}
MEDLINE_ENCYCLOPEDIA = "https://medlineplus.gov/encyclopedia.html"   # medical encyclopedia:contentReference[oaicite:6]{index=6}

def crawl_medlineplus():
    out_dir = os.path.join(RAW_DIR, "medlineplus")
    ensure_dir(out_dir)

    topic_links = get_links(
        MEDLINE_HEALTH_TOPICS,
        domain_filter="medlineplus.gov",
        href_contains=["/ency/", "/health/"]
    )

    enc_links = get_links(
        MEDLINE_ENCYCLOPEDIA,
        domain_filter="medlineplus.gov",
        href_contains=["/ency/"]
    )

    all_links = topic_links | enc_links
    print(f"[MedlinePlus] found {len(all_links)} pages")

    for url in tqdm(sorted(all_links), desc="MedlinePlus pages"):
        html = fetch(url)
        if not html:
            continue
        fname = safe_filename(url)
        save_file(out_dir, fname, html, binary=False)

# -------- India: NHP + others --------

NHP_DISEASE_AZ = "https://www.nhp.gov.in/disease-a-z"  # health A–Z:contentReference[oaicite:7]{index=7}

def crawl_nhp():
    out_dir = os.path.join(RAW_DIR, "india_nhp")
    ensure_dir(out_dir)

    # First, get individual disease pages from A–Z index
    disease_links = get_links(
        NHP_DISEASE_AZ,
        domain_filter="nhp.gov.in",
        href_contains=["/disease/"]
    )

    print(f"[NHP] found {len(disease_links)} pages")

    for url in tqdm(sorted(disease_links), desc="NHP pages"):
        html = fetch(url)
        if not html:
            continue
        fname = safe_filename(url)
        save_file(out_dir, fname, html, binary=False)

# Generic PDF grabber for AIIMS, ICMR, TN, UNICEF, etc.

def crawl_pdfs_from_page(index_url: str, subfolder: str):
    out_dir = os.path.join(RAW_DIR, subfolder)
    ensure_dir(out_dir)

    html = fetch(index_url)
    if not html:
        return
    soup = BeautifulSoup(html, "html.parser")
    pdf_links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if ".pdf" in href.lower():
            full = up.urljoin(index_url, href)
            pdf_links.add(full)

    print(f"[PDF CRAWL] {index_url} -> {len(pdf_links)} pdfs")

    for url in tqdm(sorted(pdf_links), desc=f"PDFs {subfolder}"):
        content = fetch(url, binary=True)
        if not content:
            continue
        fname = safe_filename(url)
        save_file(out_dir, fname.replace(".html", ".pdf"), content, binary=True)

def main():
    crawl_who()
    crawl_cdc()
    crawl_medlineplus()
    crawl_nhp()

    # Examples – update these with real patient education / brochure pages:
    # AIIMS patient education
    crawl_pdfs_from_page("https://www.aiims.edu/en/patient-education.html", "india_other")

    # Tamil Nadu health department
    crawl_pdfs_from_page("https://tnhealth.tn.gov.in/", "india_other")

    # UNICEF general reports index (filter to health-related later)
    crawl_pdfs_from_page("https://www.unicef.org/reports", "unicef")

if __name__ == "__main__":
    main()
