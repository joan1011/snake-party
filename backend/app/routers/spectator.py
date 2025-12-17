from fastapi import APIRouter, HTTPException, status
from typing import List
from ..schemas import ActivePlayer, SpectatorCount

router = APIRouter(prefix="/spectator", tags=["spectator"])

# In-memory storage for active players (transient data)
active_players: List[ActivePlayer] = []

@router.get("/active", response_model=List[ActivePlayer])
def get_active_players():
    return active_players

@router.get("/{playerId}", response_model=ActivePlayer)
def watch_player(playerId: str):
    player = next((p for p in active_players if p.id == playerId), None)
    if not player:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Player not found")
    return player

@router.get("/{playerId}/count", response_model=SpectatorCount)
def get_spectator_count(playerId: str):
    return {"count": 42} # Mock
