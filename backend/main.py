from fastapi import FastAPI
import pickle

app = FastAPI()

# Load model
model = pickle.load(open("../ml/lr_model.pkl", "rb"))
vectorizer = pickle.load(open("../ml/vectorizer.pkl", "rb"))

@app.get("/")
def home():
    return {"message": "Fake News Detection API is running"}

@app.post("/predict")
def predict(data: dict):
    text = data["text"]

    vec = vectorizer.transform([text])
    prediction = model.predict(vec)[0]
    prob = model.predict_proba(vec)[0].max()

    return {
        "prediction": "REAL" if prediction == 1 else "FAKE",
        "confidence": float(prob)
    }