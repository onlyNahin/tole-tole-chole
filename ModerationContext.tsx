
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModerationItem } from './types';
import { supabase } from './services/supabaseClient';

interface ModerationContextType {
  queue: ModerationItem[];
  isLoading: boolean;
  approveItem: (id: string) => Promise<void>;
  rejectItem: (id: string) => Promise<void>;
}

const ModerationContext = createContext<ModerationContextType | undefined>(undefined);

export const ModerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('moderation_queue')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching moderation queue:', error);
    } else {
      setQueue((data || []).map(item => ({
        id: item.id,
        user: item.user_name,
        image: item.image_url,
        type: item.type,
        time: new Date(item.created_at).toLocaleString()
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const approveItem = async (id: string) => {
    const { error } = await supabase
      .from('moderation_queue')
      .update({ status: 'Approved' })
      .eq('id', id);

    if (error) {
      console.error('Error approving item:', error);
    } else {
      setQueue(prev => prev.filter(item => item.id !== id));
    }
  };

  const rejectItem = async (id: string) => {
    const { error } = await supabase
      .from('moderation_queue')
      .update({ status: 'Rejected' })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting item:', error);
    } else {
      setQueue(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <ModerationContext.Provider value={{ queue, isLoading, approveItem, rejectItem }}>
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
