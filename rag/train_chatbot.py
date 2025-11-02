# ===========================================
# train_chatbot.py — Dataset Preprocessing & Model Training
# ===========================================

import pandas as pd
import numpy as np
import re
import string
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk

# Download required resources automatically (runs only if missing)
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('punkt')

# Download NLTK resources
nltk.download('stopwords')
nltk.download('wordnet')

# -------------------------------------------
# Step 1: Load Dataset
# -------------------------------------------
df = pd.read_csv("rag\healthcare_dataset.csv")
print("Initial shape:", df.shape)

# Drop duplicates & missing values
df.drop_duplicates(inplace=True)
df.dropna(inplace=True)

# Standardize column names
df = df.rename(columns=lambda x: x.strip().lower())
if 'question' not in df.columns or 'answer' not in df.columns:
    raise ValueError("Dataset must contain 'Question' and 'Answer' columns.")

# -------------------------------------------
# Step 2: Text Cleaning
# -------------------------------------------
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = [lemmatizer.lemmatize(w) for w in text.split() if w not in stop_words]
    return " ".join(tokens)

df['clean_question'] = df['question'].apply(clean_text)
df['clean_answer'] = df['answer'].apply(clean_text)

# -------------------------------------------
# Step 3: TF-IDF Training
# -------------------------------------------
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(df['clean_question'])
print("TF-IDF matrix shape:", tfidf_matrix.shape)

# -------------------------------------------
# Step 4: Save Trained Artifacts
# -------------------------------------------
with open("chatbot_vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

df.to_csv("cleaned_healthcare_dataset.csv", index=False)

print("✅ Training complete!")
print("Saved: cleaned_healthcare_dataset.csv and chatbot_vectorizer.pkl")
