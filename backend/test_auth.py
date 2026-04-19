import pytest
from fastapi.testclient import TestClient

import db
from main import app


@pytest.fixture()
def client(tmp_path):
    db.DATABASE_PATH = str(tmp_path / "test.db")
    with TestClient(app) as c:
        yield c


def test_signup_creates_account(client):
    res = client.post("/api/auth/signup", json={"username": "alice", "password": "secret"})
    assert res.status_code == 200
    assert "token" in res.json()


def test_signup_seeds_default_board(client):
    res = client.post("/api/auth/signup", json={"username": "alice", "password": "secret"})
    token = res.json()["token"]
    boards = client.get("/api/boards", headers={"Authorization": f"Bearer {token}"}).json()
    assert len(boards) == 1
    assert boards[0]["name"] == "My Board"


def test_signup_duplicate_username_returns_409(client):
    client.post("/api/auth/signup", json={"username": "alice", "password": "secret"})
    res = client.post("/api/auth/signup", json={"username": "alice", "password": "other"})
    assert res.status_code == 409


def test_login_success(client):
    client.post("/api/auth/signup", json={"username": "user", "password": "password"})
    res = client.post("/api/auth/login", json={"username": "user", "password": "password"})
    assert res.status_code == 200
    assert "token" in res.json()


def test_login_wrong_password(client):
    client.post("/api/auth/signup", json={"username": "user", "password": "password"})
    res = client.post("/api/auth/login", json={"username": "user", "password": "wrong"})
    assert res.status_code == 401


def test_login_wrong_username(client):
    res = client.post("/api/auth/login", json={"username": "ghost", "password": "password"})
    assert res.status_code == 401


def test_me_with_valid_token(client):
    signup_res = client.post("/api/auth/signup", json={"username": "alice", "password": "secret"})
    token = signup_res.json()["token"]
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json() == {"username": "alice"}


def test_me_without_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_me_with_invalid_token(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert res.status_code == 401


def test_logout(client):
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
