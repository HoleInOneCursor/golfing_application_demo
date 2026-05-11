from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from golf.backend.database import Base, get_db
from golf.backend.main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def create_course(client: TestClient, name: str = "Pebble Beach") -> dict:
    response = client.post(
        "/api/courses",
        json={
            "name": name,
            "location": "Pebble Beach, CA",
            "holes": 18,
            "par": 72,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_health_check(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list_courses(client: TestClient) -> None:
    created = create_course(client)

    assert created["id"] == 1
    assert created["name"] == "Pebble Beach"

    response = client.get("/api/courses")

    assert response.status_code == 200
    assert response.json() == [created]


def test_create_and_list_rounds(client: TestClient) -> None:
    course = create_course(client)

    response = client.post(
        "/api/rounds",
        json={
            "course_id": course["id"],
            "player_name": "Ada Lovelace",
            "score": 70,
            "date_played": "2026-05-10",
        },
    )

    assert response.status_code == 201
    created_round = response.json()
    assert created_round == {
        "id": 1,
        "course_id": course["id"],
        "player_name": "Ada Lovelace",
        "score": 70,
        "date_played": "2026-05-10",
    }

    list_response = client.get("/api/rounds")

    assert list_response.status_code == 200
    assert list_response.json() == [created_round]


def test_filter_rounds_by_course_id(client: TestClient) -> None:
    first_course = create_course(client, name="Pebble Beach")
    second_course = create_course(client, name="Augusta National")

    first_round = client.post(
        "/api/rounds",
        json={
            "course_id": first_course["id"],
            "player_name": "Ada Lovelace",
            "score": 70,
            "date_played": "2026-05-10",
        },
    ).json()
    client.post(
        "/api/rounds",
        json={
            "course_id": second_course["id"],
            "player_name": "Grace Hopper",
            "score": 74,
            "date_played": "2026-05-11",
        },
    )

    response = client.get(f"/api/rounds?course_id={first_course['id']}")

    assert response.status_code == 200
    assert response.json() == [first_round]


def test_create_round_requires_existing_course(client: TestClient) -> None:
    response = client.post(
        "/api/rounds",
        json={
            "course_id": 999,
            "player_name": "Ada Lovelace",
            "score": 70,
            "date_played": "2026-05-10",
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found"}
