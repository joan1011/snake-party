from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
from enum import Enum

class GameMode(str, Enum):
    PASS_THROUGH = "pass-through"
    WALLS = "walls"

class UserBase(BaseModel):
    username: str
    email: EmailStr

class User(UserBase):
    id: str
    highScore: int
    gamesPlayed: int
    createdAt: datetime

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
