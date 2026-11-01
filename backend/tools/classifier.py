import joblib
import os

# Get the absolute path to the models directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "phishing_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")

# Load models globally so they don't reload on every request
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("ML Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")

def classify_message(text: str):
    """
    Uses the trained ML model to predict if a message is phishing.
    Returns a dictionary with the probability and the raw prediction.
    """
    if not text.strip():
        return {"probability": 0.0, "is_phishing": False}
        
    # Convert text to TF-IDF vector
    text_vec = vectorizer.transform([text])
    
    # Get probability of class 1 (Suspicious)
    # predict_proba returns [prob_class_0, prob_class_1]
    prob = model.predict_proba(text_vec)[0][1]
    
    return {
        "probability": float(prob),
        "is_phishing": bool(prob > 0.5)
    }