import React from 'react';
import { SpectatorView } from '@/components/spectator/SpectatorView';

export function SpectatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <SpectatorView />
      </div>
    </div>
  );
}
