from fastapi import APIRouter, Depends, status
from typing import List, Optional
from datetime import date
from ..models import LeaderboardEntry, GameMode, GameResult
from ..database import db
from .auth import get_current_user

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])

@router.get("", response_model=List[LeaderboardEntry])
def get_leaderboard(mode: Optional[GameMode] = None, limit: int = 10):
    with db.lock:
        entries = db.leaderboard
        if mode:
            entries = [e for e in entries if e["mode"] == mode]
        
        entries.sort(key=lambda x: x["score"], reverse=True)
        
        result = []
        for i, entry in enumerate(entries[:limit]):
            e = entry.copy()
            e["rank"] = i + 1
            result.append(e)
            
        return result

@router.post("/scores", response_model=Optional[LeaderboardEntry], status_code=status.HTTP_200_OK)
def submit_score(result: GameResult, current_user: dict = Depends(get_current_user)):
    with db.lock:
        current_user["gamesPlayed"] += 1
        if result.score > current_user["highScore"]:
            current_user["highScore"] = result.score
            
        entry = {
            "rank": 0,
            "userId": current_user["id"],
            "username": current_user["username"],
            "score": result.score,
            "mode": result.mode,
            "date": date.today()
        }
        db.leaderboard.append(entry)
        
        all_mode = [e for e in db.leaderboard if e["mode"] == result.mode]
        all_mode.sort(key=lambda x: x["score"], reverse=True)
        rank = next((i + 1 for i, e in enumerate(all_mode) if e is entry), 999)
        
        entry["rank"] = rank
        return entry

@router.get("/rank/{userId}", response_model=dict)
def get_user_rank(userId: str):
    with db.lock:
        user_entries = [e for e in db.leaderboard if e["userId"] == userId]
        if not user_entries:
            return {"rank": None}
            
        best_entry = max(user_entries, key=lambda x: x["score"])
        mode = best_entry["mode"]
        
        all_mode = [e for e in db.leaderboard if e["mode"] == mode]
        all_mode.sort(key=lambda x: x["score"], reverse=True)
        
        rank = next((i + 1 for i, e in enumerate(all_mode) if e["userId"] == userId and e["score"] == best_entry["score"]), None)
        return {"rank": rank}
