from fastapi import FastAPI
import pickle
from database import engine
from models import Base
from database import SessionLocal
from models import Prediction

Base.metadata.create_all(bind=engine)
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

    result = "REAL" if prediction == 1 else "FAKE"

    # Save to DB
    db = SessionLocal()
    db_entry = Prediction(
        text=text,
        prediction=result,
        confidence=float(prob)
    )
    db.add(db_entry)
    db.commit()
    db.close()

    return {
        "prediction": result,
        "confidence": float(prob)
    }



@app.get("/history")
def get_history():
    db = SessionLocal()
    records = db.query(Prediction).all()
    db.close()

    return [
        {
            "id": r.id,
            "text": r.text,
            "prediction": r.prediction,
            "confidence": r.confidence,
            "created_at": r.created_at
        }
        for r in records
    ]