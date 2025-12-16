// Real API service using Axios and OpenAPI types
import axios, { AxiosError } from 'axios';
import { components } from './schema';

// Types derived from OpenAPI schema
export type User = components["schemas"]["User"];
export type LeaderboardEntry = components["schemas"]["LeaderboardEntry"];
export type ActivePlayer = components["schemas"]["ActivePlayer"];
export type GameMode = components["schemas"]["GameMode"];
export type GameResult = components["schemas"]["GameResult"];
export type UserStats = components["schemas"]["UserStats"];
export type GlobalStats = components["schemas"]["GlobalStats"];
export type AuthResponse = components["schemas"]["AuthResponse"];

// Token management
const TOKEN_KEY = 'snake_party_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    setToken(data.token);
    return data.user;
  },

  async signup(username: string, email: string, password: string): Promise<User> {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', { username, email, password });
    setToken(data.token);
    return data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      removeToken();
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getToken();
    if (!token) return null;
    try {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    } catch {
      return null;
    }
  },

  async updateProfile(updates: { username: string; email: string }): Promise<User> {
    const { data } = await apiClient.patch<User>('/auth/me', updates);
    return data;
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode, limit = 10): Promise<LeaderboardEntry[]> {
    const params = { mode, limit };
    const { data } = await apiClient.get<LeaderboardEntry[]>('/leaderboards', { params });
    return data;
  },

  async submitScore(result: GameResult): Promise<LeaderboardEntry | null> {
    // Only submit if cached token exists, though middleware handles it.
    if (!getToken()) return null;
    try {
      const { data } = await apiClient.post<LeaderboardEntry>('/leaderboards/scores', result);
      return data;
    } catch (e) {
      console.error("Failed to submit score", e);
      return null; // Return null on failure or not high enough score as per original contract
    }
  },

  async getUserRank(userId: string): Promise<number | null> {
    const { data } = await apiClient.get<{ rank: number | null }>(`/leaderboards/rank/${userId}`);
    return data.rank;
  },
};

// Spectator API
export const spectatorApi = {
  async getActivePlayers(): Promise<ActivePlayer[]> {
    const { data } = await apiClient.get<ActivePlayer[]>('/spectator/active');
    return data;
  },

  async watchPlayer(playerId: string): Promise<ActivePlayer | null> {
    try {
      const { data } = await apiClient.get<ActivePlayer>(`/spectator/${playerId}`);
      return data;
    } catch {
      return null;
    }
  },

  async getSpectatorCount(playerId: string): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>(`/spectator/${playerId}/count`);
    return data.count;
  },
};

// Game Stats API
export const gameStatsApi = {
  async getPlayerStats(userId: string): Promise<UserStats> {
    const { data } = await apiClient.get<UserStats>(`/stats/user/${userId}`);
    return data;
  },

  async getGlobalStats(): Promise<GlobalStats> {
    const { data } = await apiClient.get<GlobalStats>('/stats/global');
    return data;
  },
};
