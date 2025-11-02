# Healthcare Chatbot

### Description
A retrieval-based healthcare chatbot trained on a question–answer dataset using TF-IDF and cosine similarity.

### Features
- Preprocesses and cleans text
- Trains TF-IDF model
- Evaluates accuracy
- Serves chatbot via Flask API

### Run Steps
1. `pip install -r requirements.txt`
2. Place your `healthcare_dataset.csv` in root folder.
3. Train model: `python train_chatbot.py`
4. Evaluate accuracy: `python evaluate_chatbot.py`
5. Run backend: `python app.py`
6. Test endpoint: `http://127.0.0.1:5000/chat`
