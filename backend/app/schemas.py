from pydantic import BaseModel, EmailStr, ConfigDict, Field, BeforeValidator
from typing import List, Optional, Annotated
from datetime import datetime, date
from enum import Enum

class GameMode(str, Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class UserBase(BaseModel):
    username: str
    email: EmailStr

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: Annotated[str, BeforeValidator(str)]
    highScore: int = Field(validation_alias='high_score')
    gamesPlayed: int = Field(validation_alias='games_played')
    createdAt: datetime = Field(validation_alias='created_at')

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    rank: int
    userId: str
    username: str
    score: int
    mode: GameMode
    date: date

class GameResult(BaseModel):
    score: int
    mode: GameMode
    duration: int

class ActivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    startedAt: datetime

class SpectatorCount(BaseModel):
    count: int

class UserStats(BaseModel):
    highScore: int
    gamesPlayed: int
    averageScore: int

class GlobalStats(BaseModel):
    totalPlayers: int
    totalGames: int
    highestScore: int
