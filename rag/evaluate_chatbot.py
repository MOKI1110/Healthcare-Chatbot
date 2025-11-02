# ===========================================
# evaluate_chatbot.py — Accuracy Evaluation
# ===========================================

import pandas as pd
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity

# Load preprocessed data and model
df = pd.read_csv("cleaned_healthcare_dataset.csv")
with open("chatbot_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

tfidf_matrix = vectorizer.transform(df['clean_question'])

def evaluate_chatbot(top_k=3):
    total = len(df)
    correct_top1 = 0
    correct_topk = 0

    for i, question in enumerate(df['clean_question']):
        query_vec = vectorizer.transform([question])
        sim = cosine_similarity(query_vec, tfidf_matrix)[0]
        sorted_idx = np.argsort(sim)[::-1]

        if sorted_idx[0] == i:
            correct_top1 += 1
        if i in sorted_idx[:top_k]:
            correct_topk += 1

    acc1 = correct_top1 / total * 100
    acck = correct_topk / total * 100
    print(f"✅ Evaluated {total} samples")
    print(f"Top-1 Accuracy: {acc1:.2f}%")
    print(f"Top-{top_k} Accuracy: {acck:.2f}%")

evaluate_chatbot(top_k=3)
