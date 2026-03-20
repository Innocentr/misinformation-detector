from __future__ import annotations

from typing import Any


def run_misinformation_prediction(ml_models: dict[str, Any], text: str) -> tuple[str, float]:
    vectorizer = ml_models["vectorizer"]
    model = ml_models["model"]

    vec = vectorizer.transform([text])
    prediction_idx = model.predict(vec)[0]
    probabilities = model.predict_proba(vec)[0]
    probability = float(max(probabilities))
    result = "REAL" if prediction_idx == 1 else "FAKE"

    return result, probability
