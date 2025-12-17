from fastapi import APIRouter, Depends, status, HTTPException
from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func
from ..models import Game as GameModel, User as UserModel
from ..schemas import LeaderboardEntry, GameMode, GameResult
from ..database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[GameMode] = None, limit: int = 10, db: AsyncSession = Depends(get_db)):
    query = select(GameModel, UserModel).join(UserModel).order_by(desc(GameModel.score))
    
    if mode:
        query = query.where(GameModel.mode == mode)
    
    query = query.limit(limit)
    
    result = await db.execute(query)
    games = result.all()
    
    entries = []
    for i, (game, user) in enumerate(games):
        entries.append(LeaderboardEntry(
            rank=i + 1,
            userId=str(user.id),
            username=user.username,
            score=game.score,
            mode=game.mode,
            date=game.played_at.date()
        ))
    return entries

@router.post("/scores", response_model=Optional[LeaderboardEntry], status_code=status.HTTP_200_OK)
async def submit_score(
    result: GameResult, 
    current_user: UserModel = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Record the game
    new_game = GameModel(
        user_id=current_user.id,
        score=result.score,
        mode=result.mode,
        duration=result.duration
    )
    db.add(new_game)
    
    # Update user stats
    current_user.games_played += 1
    if result.score > current_user.high_score:
        current_user.high_score = result.score
    
    # Commit changes
    await db.commit()
    await db.refresh(new_game)
    
    # Calculate rank (basic implementation: count games with higher score in same mode)
    rank_query = select(func.count()).select_from(GameModel).where(
        GameModel.mode == result.mode,
        GameModel.score > result.score
    )
    rank_res = await db.execute(rank_query)
    rank = rank_res.scalar() + 1
    
    return LeaderboardEntry(
        rank=rank,
        userId=str(current_user.id),
        username=current_user.username,
        score=new_game.score,
        mode=new_game.mode,
        date=new_game.played_at.date()
    )

@router.get("/rank/{userId}", response_model=dict)
async def get_user_rank(userId: str, db: AsyncSession = Depends(get_db)):
    # Find user's best game
    try:
        uid = int(userId)
    except ValueError:
        return {"rank": None}

    best_game_query = select(GameModel).where(GameModel.user_id == uid).order_by(desc(GameModel.score)).limit(1)
    res = await db.execute(best_game_query)
    best_game = res.scalars().first()
    
    if not best_game:
        return {"rank": None}
    
    # Calculate global rank for that score/mode
    rank_query = select(func.count()).select_from(GameModel).where(
        GameModel.mode == best_game.mode,
        GameModel.score > best_game.score
    )
    rank_res = await db.execute(rank_query)
    rank = rank_res.scalar() + 1
    
    return {"rank": rank}
