
import React, { createContext, useContext, useState } from 'react';
import { ModerationItem } from './types';
import { MOCK_MODERATION_QUEUE } from './constants';

interface ModerationContextType {
  queue: ModerationItem[];
  approveItem: (id: string) => void;
  rejectItem: (id: string) => void;
}

const ModerationContext = createContext<ModerationContextType | undefined>(undefined);

export const ModerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<ModerationItem[]>(MOCK_MODERATION_QUEUE);

  const approveItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    // In a real app, this would trigger an API call to update status
  };

  const rejectItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    // In a real app, this would trigger an API call to delete/reject content
  };

  return (
    <ModerationContext.Provider value={{ queue, approveItem, rejectItem }}>
      {children}
    </ModerationContext.Provider>
  );
};

export const useModeration = () => {
  const context = useContext(ModerationContext);
  if (!context) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
};
