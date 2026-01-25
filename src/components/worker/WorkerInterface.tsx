import { useState } from 'react';
import { PinEntry } from './PinEntry';
import { GamingPosts } from './GamingPosts';
import { useGameStore } from '@/store/gameStore';

export const WorkerInterface = () => {
  const { activeSession } = useGameStore();
  const [authenticated, setAuthenticated] = useState(!!activeSession);

  if (!authenticated) {
    return <PinEntry onSuccess={() => setAuthenticated(true)} />;
  }

  return <GamingPosts onLogout={() => setAuthenticated(false)} />;
};
