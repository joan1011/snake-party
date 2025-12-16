from fastapi import APIRouter, HTTPException, status
from ..models import UserStats, GlobalStats
from ..database import db

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/user/{userId}", response_model=UserStats)
def get_user_stats(userId: str):
    with db.lock:
        user = next((u for u in db.users if u["id"] == userId), None)
        if not user:
             raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
        
        return {
            "highScore": user["highScore"],
            "gamesPlayed": user["gamesPlayed"],
            "averageScore": int(user["highScore"] * 0.6) if user["gamesPlayed"] > 0 else 0
        }

@router.get("/global", response_model=GlobalStats)
def get_global_stats():
    with db.lock:
        total_score = max((e["score"] for e in db.leaderboard), default=0)
        return {
            "totalPlayers": len(db.users),
            "totalGames": sum(u["gamesPlayed"] for u in db.users),
            "highestScore": total_score
        }
