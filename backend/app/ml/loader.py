from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any

MODEL_DIR = Path(__file__).resolve().parent


def _load_pickle(path: Path) -> Any:
    with path.open("rb") as file:
        return pickle.load(file)


def load_ml_models() -> dict[str, Any]:
    return {
        "model": _load_pickle(MODEL_DIR / "lr_model.pkl"),
        "vectorizer": _load_pickle(MODEL_DIR / "vectorizer.pkl"),
    }
