from fastapi.testclient import TestClient


def register_user(client: TestClient, username: str, password: str) -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": username,
            "password": password,
            "is_active": True,
            "is_superuser": False,
        },
    )
    assert response.status_code == 200
    return response.json()


def login_user(client: TestClient, username: str, password: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": username, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_features_endpoint_lists_available_and_planned_tools(client: TestClient):
    response = client.get("/api/v1/features/")

    assert response.status_code == 200
    payload = response.json()
    assert any(item["slug"] == "misinformation-detector" for item in payload)
    assert any(item["slug"] == "cv-optimizer" for item in payload)


def test_register_and_login_flow(client: TestClient):
    created_user = register_user(client, "apiuser", "verysecurepass")
    token = login_user(client, "apiuser", "verysecurepass")

    assert created_user["username"] == "apiuser"
    assert token


def test_register_rejects_duplicate_username(client: TestClient):
    register_user(client, "duplicate", "verysecurepass")

    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "duplicate",
            "password": "verysecurepass",
            "is_active": True,
            "is_superuser": False,
        },
    )

    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_predict_and_history_flow(client: TestClient):
    register_user(client, "predictuser", "verysecurepass")
    token = login_user(client, "predictuser", "verysecurepass")

    predict_response = client.post(
        "/api/v1/predict/",
        json={"text": "Trusted newsroom bulletin"},
        headers=auth_headers(token),
    )

    assert predict_response.status_code == 200
    prediction_payload = predict_response.json()
    assert prediction_payload["prediction"] == "REAL"
    assert prediction_payload["confidence"] == 0.97

    history_response = client.get(
        "/api/v1/history/",
        headers=auth_headers(token),
    )

    assert history_response.status_code == 200
    history_payload = history_response.json()
    assert len(history_payload) == 1
    assert history_payload[0]["text"] == "Trusted newsroom bulletin"


def test_predict_requires_authentication(client: TestClient):
    response = client.post(
        "/api/v1/predict/",
        json={"text": "Trusted newsroom bulletin"},
    )

    assert response.status_code == 401
