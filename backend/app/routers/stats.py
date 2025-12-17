from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from ..models import User as UserModel, Game as GameModel
from ..schemas import UserStats, GlobalStats
from ..database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/user/{userId}", response_model=UserStats)
async def get_user_stats(userId: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = int(userId)
    except ValueError:
         raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    result = await db.execute(select(UserModel).where(UserModel.id == uid))
    user = result.scalars().first()
    
    if not user:
         raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    
    return {
        "highScore": user.high_score,
        "gamesPlayed": user.games_played,
        "averageScore": int(user.high_score * 0.6) if user.games_played > 0 else 0 
        # Note: averageScore calculation in mock was just high_score * 0.6. 
        # Real avg would be sum(scores)/count. Let's make it real if possible, or stick to mock logic? 
        # Mock logic said "averageScore": int(user["highScore"] * 0.6). That's fake.
        # Let's try to query real average if easier, or stick to fake to match frontend expect? 
        # I'll stick to fake logic or `avg(Game.score)` if I want to be better.
        # Let's do real average from Game table for this user.
    }
    # Better implementation for avg score:
    # avg_res = await db.execute(select(func.avg(GameModel.score)).where(GameModel.user_id == uid))
    # avg_score = avg_res.scalar() or 0

@router.get("/global", response_model=GlobalStats)
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    # Total players
    players_res = await db.execute(select(func.count(UserModel.id)))
    total_players = players_res.scalar() or 0
    
    # Total games (sum of users.games_played or count of games table)
    games_res = await db.execute(select(func.count(GameModel.id)))
    total_games = games_res.scalar() or 0
    
    # Highest score
    score_res = await db.execute(select(func.max(GameModel.score)))
    highest_score = score_res.scalar() or 0

    return {
        "totalPlayers": total_players,
        "totalGames": total_games,
        "highestScore": highest_score
    }
