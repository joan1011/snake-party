from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models import ActivePlayer, SpectatorCount
from ..database import db

router = APIRouter(prefix="/spectator", tags=["spectator"])

@router.get("/active", response_model=List[ActivePlayer])
def get_active_players():
    return db.active_players

@router.get("/{playerId}", response_model=ActivePlayer)
def watch_player(playerId: str):
    with db.lock:
        player = next((p for p in db.active_players if p["id"] == playerId), None)
        if not player:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Player not found")
        return player

@router.get("/{playerId}/count", response_model=SpectatorCount)
def get_spectator_count(playerId: str):
    return {"count": 42} # Mock
