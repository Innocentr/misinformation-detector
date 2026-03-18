# ML Model - Fake News Detection

## Overview
This model classifies news articles as FAKE or REAL using TF-IDF and Logistic Regression.

## Performance
- Accuracy: ~98.9%
- Balanced precision and recall

## Features
- Text preprocessing
- TF-IDF vectorization (unigrams + bigrams)
- Explainability via feature importance

## Observations
- Model relies on stylistic indicators (e.g., "Reuters")
- Potential dataset bias

## Files
- model.pkl
- vectorizer.pkl