from datetime import date
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from . import models
from .database import Base, engine, get_db


class CourseBase(BaseModel):
    name: str
    location: str
    holes: int
    par: int


class CourseCreate(CourseBase):
    pass


class Course(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class RoundBase(BaseModel):
    course_id: int
    player_name: str
    score: int
    date_played: date


class RoundCreate(RoundBase):
    pass


class Round(RoundBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


app = FastAPI(title="Golf Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/courses", response_model=list[Course])
def list_courses(db: Annotated[Session, Depends(get_db)]) -> list[models.Course]:
    return db.query(models.Course).order_by(models.Course.id).all()


@app.post("/api/courses", response_model=Course, status_code=status.HTTP_201_CREATED)
def create_course(
    course: CourseCreate, db: Annotated[Session, Depends(get_db)]
) -> models.Course:
    db_course = models.Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@app.get("/api/rounds", response_model=list[Round])
def list_rounds(
    db: Annotated[Session, Depends(get_db)],
    course_id: Annotated[int | None, Query()] = None,
) -> list[models.Round]:
    query = db.query(models.Round)
    if course_id is not None:
        query = query.filter(models.Round.course_id == course_id)
    return query.order_by(models.Round.id).all()


@app.post("/api/rounds", response_model=Round, status_code=status.HTTP_201_CREATED)
def create_round(
    round_data: RoundCreate, db: Annotated[Session, Depends(get_db)]
) -> models.Round:
    course = db.get(models.Course, round_data.course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    db_round = models.Round(**round_data.model_dump())
    db.add(db_round)
    db.commit()
    db.refresh(db_round)
    return db_round
