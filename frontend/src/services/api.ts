// Centralized mock API service
// All backend calls go through here for easy replacement with real API later

export interface User {
  id: string;
  username: string;
  email: string;
  highScore: number;
  gamesPlayed: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  mode: GameMode;
  date: string;
}

export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  startedAt: string;
}

export type GameMode = 'pass-through' | 'walls';

export interface GameResult {
  score: number;
  mode: GameMode;
  duration: number;
}

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulating database)
let currentUser: User | null = null;

const mockUsers: User[] = [
  { id: '1', username: 'PixelMaster', email: 'pixel@game.com', highScore: 2450, gamesPlayed: 156, createdAt: '2024-01-15' },
  { id: '2', username: 'SnakeKing', email: 'snake@game.com', highScore: 3200, gamesPlayed: 243, createdAt: '2024-02-20' },
  { id: '3', username: 'ArcadeQueen', email: 'arcade@game.com', highScore: 2890, gamesPlayed: 189, createdAt: '2024-03-10' },
  { id: '4', username: 'RetroGamer', email: 'retro@game.com', highScore: 1750, gamesPlayed: 98, createdAt: '2024-04-05' },
  { id: '5', username: 'NeonNinja', email: 'neon@game.com', highScore: 2100, gamesPlayed: 134, createdAt: '2024-05-12' },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '2', username: 'SnakeKing', score: 3200, mode: 'walls', date: '2024-12-10' },
  { rank: 2, userId: '3', username: 'ArcadeQueen', score: 2890, mode: 'pass-through', date: '2024-12-12' },
  { rank: 3, userId: '1', username: 'PixelMaster', score: 2450, mode: 'walls', date: '2024-12-14' },
  { rank: 4, userId: '5', username: 'NeonNinja', score: 2100, mode: 'pass-through', date: '2024-12-13' },
  { rank: 5, userId: '4', username: 'RetroGamer', score: 1750, mode: 'walls', date: '2024-12-11' },
  { rank: 6, userId: '6', username: 'GameMaster99', score: 1680, mode: 'pass-through', date: '2024-12-09' },
  { rank: 7, userId: '7', username: 'CyberSnake', score: 1590, mode: 'walls', date: '2024-12-08' },
  { rank: 8, userId: '8', username: 'DigitalDragon', score: 1420, mode: 'pass-through', date: '2024-12-07' },
  { rank: 9, userId: '9', username: 'PixelPunk', score: 1350, mode: 'walls', date: '2024-12-06' },
  { rank: 10, userId: '10', username: 'ArcadeAce', score: 1280, mode: 'pass-through', date: '2024-12-05' },
];

const mockActivePlayers: ActivePlayer[] = [
  { id: 'ap1', username: 'LivePlayer1', score: 450, mode: 'walls', startedAt: new Date().toISOString() },
  { id: 'ap2', username: 'StreamSnake', score: 320, mode: 'pass-through', startedAt: new Date().toISOString() },
  { id: 'ap3', username: 'ProGamer2024', score: 780, mode: 'walls', startedAt: new Date().toISOString() },
];

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === email);
    if (!user || password.length < 6) {
      throw new Error('Invalid email or password');
    }
    
    currentUser = user;
    return { user, token: 'mock-jwt-token-' + user.id };
  },

  async signup(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500);
    
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    if (mockUsers.find(u => u.username === username)) {
      throw new Error('Username already taken');
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username,
      email,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    currentUser = newUser;
    return { user: newUser, token: 'mock-jwt-token-' + newUser.id };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    return currentUser;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    await delay(300);
    if (!currentUser) throw new Error('Not authenticated');
    
    Object.assign(currentUser, updates);
    return currentUser;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode, limit = 10): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return entries.slice(0, limit);
  },

  async submitScore(result: GameResult): Promise<LeaderboardEntry | null> {
    await delay(400);
    
    if (!currentUser) return null;
    
    // Update user stats
    currentUser.gamesPlayed++;
    if (result.score > currentUser.highScore) {
      currentUser.highScore = result.score;
    }
    
    // Check if qualifies for leaderboard
    const qualifies = result.score > (mockLeaderboard[mockLeaderboard.length - 1]?.score || 0);
    
    if (qualifies) {
      const entry: LeaderboardEntry = {
        rank: 0,
        userId: currentUser.id,
        username: currentUser.username,
        score: result.score,
        mode: result.mode,
        date: new Date().toISOString().split('T')[0],
      };
      
      mockLeaderboard.push(entry);
      mockLeaderboard.sort((a, b) => b.score - a.score);
      mockLeaderboard.forEach((e, i) => e.rank = i + 1);
      
      return entry;
    }
    
    return null;
  },

  async getUserRank(userId: string): Promise<number | null> {
    await delay(200);
    const entry = mockLeaderboard.find(e => e.userId === userId);
    return entry?.rank || null;
  },
};

// Spectator API
export const spectatorApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(300);
    
    // Simulate score updates
    mockActivePlayers.forEach(player => {
      player.score += Math.floor(Math.random() * 30);
    });
    
    return [...mockActivePlayers];
  },

  async watchPlayer(playerId: string): Promise<ActivePlayer | null> {
    await delay(200);
    return mockActivePlayers.find(p => p.id === playerId) || null;
  },

  async getSpectatorCount(playerId: string): Promise<number> {
    await delay(100);
    return Math.floor(Math.random() * 50) + 5;
  },
};

// Game Stats API
export const gameStatsApi = {
  async getPlayerStats(userId: string): Promise<{ highScore: number; gamesPlayed: number; averageScore: number }> {
    await delay(200);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    return {
      highScore: user.highScore,
      gamesPlayed: user.gamesPlayed,
      averageScore: user.gamesPlayed > 0 ? Math.floor(user.highScore * 0.6) : 0,
    };
  },

  async getGlobalStats(): Promise<{ totalPlayers: number; totalGames: number; highestScore: number }> {
    await delay(200);
    return {
      totalPlayers: mockUsers.length + 1234,
      totalGames: mockUsers.reduce((sum, u) => sum + u.gamesPlayed, 0) + 45678,
      highestScore: Math.max(...mockLeaderboard.map(e => e.score)),
    };
  },
};
