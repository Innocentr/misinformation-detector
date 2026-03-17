from fastapi import FastAPI
import pickle
from database import engine
from models import Base
from database import SessionLocal
from models import Prediction
from auth import hash_password, verify_password, create_token
from models import User
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth import decode_token

Base.metadata.create_all(bind=engine)
app = FastAPI()

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    username = decode_token(token)

    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    db.close()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# Load model
model = pickle.load(open("../ml/lr_model.pkl", "rb"))
vectorizer = pickle.load(open("../ml/vectorizer.pkl", "rb"))

@app.get("/")
def home():
    return {"message": "Fake News Detection API is running"}

@app.post("/predict")
def predict(data: dict, user: User = Depends(get_current_user)):
    text = data["text"]

    vec = vectorizer.transform([text])
    prediction = model.predict(vec)[0]
    prob = model.predict_proba(vec)[0].max()

    result = "REAL" if prediction == 1 else "FAKE"

    db = SessionLocal()
    db_entry = Prediction(
        text=text,
        prediction=result,
        confidence=float(prob),
        user_id=user.id  
    )
    db.add(db_entry)
    db.commit()
    db.close()

    return {
        "prediction": result,
        "confidence": float(prob)
    }



@app.get("/history")
def get_history(user: User = Depends(get_current_user)):
    db = SessionLocal()

    records = db.query(Prediction).filter(Prediction.user_id == user.id).all()

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



@app.post("/register")
def register(data: dict):
    db = SessionLocal()

    user = User(
        username=data["username"],
        password=hash_password(data["password"])
    )

    db.add(user)
    db.commit()
    db.close()

    return {"message": "User created"}


@app.post("/login")
def login(data: dict):
    db = SessionLocal()

    user = db.query(User).filter(User.username == data["username"]).first()

    if not user or not verify_password(data["password"], user.password):
        return {"error": "Invalid credentials"}

    token = create_token({"sub": user.username})

    db.close()

    return {"access_token": token}


