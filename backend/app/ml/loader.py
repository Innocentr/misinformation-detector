import pickle
from pathlib import Path

BASE = Path(__file__).resolve().parent

with open(BASE / "lr_model.pkl", "rb") as f:
    model = pickle.load(f)

with open(BASE / "vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)