from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    holes = Column(Integer, nullable=False)
    par = Column(Integer, nullable=False)

    rounds = relationship("Round", back_populates="course", cascade="all, delete-orphan")


class Round(Base):
    __tablename__ = "rounds"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    player_name = Column(String, nullable=False, index=True)
    score = Column(Integer, nullable=False)
    date_played = Column(Date, nullable=False)

    course = relationship("Course", back_populates="rounds")
