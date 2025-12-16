import threading
from datetime import datetime
from .models import GameMode

class MockDB:
    def __init__(self):
        self.users = []  # List[dict]
        self.leaderboard = []  # List[dict]
        self.active_players = []  # List[dict]
        self.lock = threading.Lock()
        self._init_mock_data()

    def _init_mock_data(self):
        # Users
        mock_users = [
            {"id": "1", "username": "PixelMaster", "email": "pixel@game.com", "password": "password123", "highScore": 2450, "gamesPlayed": 156, "createdAt": datetime(2024, 1, 15)},
            {"id": "2", "username": "SnakeKing", "email": "snake@game.com", "password": "password123", "highScore": 3200, "gamesPlayed": 243, "createdAt": datetime(2024, 2, 20)},
            {"id": "3", "username": "ArcadeQueen", "email": "arcade@game.com", "password": "password123", "highScore": 2890, "gamesPlayed": 189, "createdAt": datetime(2024, 3, 10)},
            {"id": "4", "username": "RetroGamer", "email": "retro@game.com", "password": "password123", "highScore": 1750, "gamesPlayed": 98, "createdAt": datetime(2024, 4, 5)},
            {"id": "5", "username": "NeonNinja", "email": "neon@game.com", "password": "password123", "highScore": 2100, "gamesPlayed": 134, "createdAt": datetime(2024, 5, 12)},
        ]
        self.users.extend(mock_users)
        
        # Leaderboard
        self.leaderboard.extend([
            {"rank": 1, "userId": "2", "username": "SnakeKing", "score": 3200, "mode": GameMode.WALLS, "date": datetime(2024, 12, 10).date()},
            {"rank": 2, "userId": "3", "username": "ArcadeQueen", "score": 2890, "mode": GameMode.PASS_THROUGH, "date": datetime(2024, 12, 12).date()},
            {"rank": 3, "userId": "1", "username": "PixelMaster", "score": 2450, "mode": GameMode.WALLS, "date": datetime(2024, 12, 14).date()},
            {"rank": 4, "userId": "5", "username": "NeonNinja", "score": 2100, "mode": GameMode.PASS_THROUGH, "date": datetime(2024, 12, 13).date()},
            {"rank": 5, "userId": "4", "username": "RetroGamer", "score": 1750, "mode": GameMode.WALLS, "date": datetime(2024, 12, 11).date()},
            {"rank": 6, "userId": "6", "username": "GameMaster99", "score": 1680, "mode": GameMode.PASS_THROUGH, "date": datetime(2024, 12, 9).date()},
            {"rank": 7, "userId": "7", "username": "CyberSnake", "score": 1590, "mode": GameMode.WALLS, "date": datetime(2024, 12, 8).date()},
            {"rank": 8, "userId": "8", "username": "DigitalDragon", "score": 1420, "mode": GameMode.PASS_THROUGH, "date": datetime(2024, 12, 7).date()},
        ])

        # Active Players
        self.active_players.extend([
            {"id": "ap1", "username": "LivePlayer1", "score": 450, "mode": GameMode.WALLS, "startedAt": datetime.now()},
            {"id": "ap2", "username": "StreamSnake", "score": 320, "mode": GameMode.PASS_THROUGH, "startedAt": datetime.now()},
            {"id": "ap3", "username": "ProGamer2024", "score": 780, "mode": GameMode.WALLS, "startedAt": datetime.now()},
        ])

db = MockDB()
