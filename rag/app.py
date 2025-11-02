# ===========================================
# app.py — Flask Chatbot Backend
# ===========================================

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import pickle, re, string, nltk
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

app = Flask(__name__)

# Load artifacts
df = pd.read_csv("cleaned_healthcare_dataset.csv")
with open("chatbot_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = str(text).lower()
    text = re.sub(f"[{re.escape(string.punctuation)}]", "", text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = [lemmatizer.lemmatize(w) for w in text.split() if w not in stop_words]
    return " ".join(tokens)

@app.route("/")
def home():
    return jsonify({"message": "Healthcare Chatbot API is running."})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("message", "")

    if not user_query.strip():
        return jsonify({"response": "Please enter a valid question."})

    cleaned = clean_text(user_query)
    query_vec = vectorizer.transform([cleaned])
    tfidf_matrix = vectorizer.transform(df['clean_question'])
    sim = cosine_similarity(query_vec, tfidf_matrix)
    idx = np.argmax(sim)
    answer = df.iloc[idx]['answer']

    return jsonify({"query": user_query, "response": answer})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
