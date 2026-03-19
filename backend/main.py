import pickle
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
# from routers import predict #will add career and sentiment

# Local imports
from database import engine, SessionLocal, get_db
from models import Base, Prediction, User
from auth import hash_password, verify_password, create_token, decode_token
from schemas import PredictionResponse, PredictRequest, UserAuth, Token # New file

# --- Lifecycle Management ---
# This ensures models are loaded correctly before the API accepts requests
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ml_models["model"] = pickle.load(open("../ml/lr_model.pkl", "rb"))
        ml_models["vectorizer"] = pickle.load(open("../ml/vectorizer.pkl", "rb"))
        print("ML models loaded successfully")
    except Exception as e:
        print(f"Critical Error: Could not load ML models: {e}")
    yield
    ml_models.clear()

# Initialize App with Lifespan
Base.metadata.create_all(bind=engine)
app = FastAPI(title="VeriTrust AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# --- Auth Dependency ---

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    username = decode_token(token)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# --- Routes ---

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    payload: PredictRequest, 
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if "model" not in ml_models:
        raise HTTPException(status_code=503, detail="Model not initialized")

    # ML Inference
    vec = ml_models["vectorizer"].transform([payload.text])
    prediction_idx = ml_models["model"].predict(vec)[0]
    prob = ml_models["model"].predict_proba(vec)[0].max()
    result = "REAL" if prediction_idx == 1 else "FAKE"

    db_entry = Prediction(
        text=payload.text,
        prediction=result,
        confidence=float(prob),
        user_id=user.id  
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/history", response_model=List[PredictionResponse])
async def get_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Prediction).filter(Prediction.user_id == user.id).all()

@app.post("/register")
async def register(user_data: UserAuth, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    new_user = User(
        username=user_data.username,
        password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/login", response_model=Token)
async def login(user_data: UserAuth, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}