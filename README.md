# Misinformation Detector

A full-stack misinformation detection app with a FastAPI backend, a React frontend, and a logistic-regression text classifier.

## Stack

- Backend: FastAPI, SQLModel, JWT auth
- Frontend: React
- ML: TF-IDF vectorizer + logistic regression
- Database: SQLite for local development

## Project Layout

```text
backend/
  app/
    api/        # FastAPI routes and dependencies
    core/       # settings, db, security
    ml/         # serialized ML artifacts and loader
    crud.py     # business logic and persistence helpers
    models.py   # SQLModel tables and API schemas
frontend/
```

## Local Setup

1. Create a virtual environment and install dependencies:

```bash
python -m venv venv
venv\Scripts\activate
pip install -e .[dev]
```

2. Create a local environment file:

```bash
copy .env.example .env
```

3. Update `.env` with a strong `SECRET_KEY`.

## Run The Backend

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000` and OpenAPI docs at `http://127.0.0.1:8000/docs`.

## Run The Frontend

```bash
cd frontend
npm install
npm start
```

## Quality Checks

Run tests:

```bash
pytest
```

Run linting:

```bash
ruff check .
```

## Current Backend Improvements

- Thin route handlers with reusable business logic in `backend/app/crud.py`
- Centralized DB setup in `backend/app/core/db.py`
- Safer model loading and logging in `backend/app/ml/loader.py` and `backend/app/main.py`
- Environment-driven configuration with `.env.example`
- Initial backend unit tests for CRUD and inference helpers
- CI automation for backend linting and tests

## Next Steps

- Add API integration tests for auth and prediction routes
- Add database migrations with Alembic
- Replace SQLite with PostgreSQL for deployed environments
- Split SQLModel tables from API schemas for cleaner backend boundaries
