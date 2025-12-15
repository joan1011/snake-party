import React from 'react';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';

export function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Leaderboard />
      </div>
    </div>
  );
}
