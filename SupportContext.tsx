import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportTicket } from './types';
import { supabase } from './services/supabaseClient';

interface SupportContextType {
  tickets: SupportTicket[];
  isLoading: boolean;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'priority' | 'date'>) => Promise<void>;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => Promise<void>;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } else {
      setTickets((data || []).map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        issue: t.issue,
        status: t.status,
        priority: t.priority,
        date: new Date(t.created_at).toLocaleDateString()
      } as SupportTicket)));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = async (ticketData: Omit<SupportTicket, 'id' | 'status' | 'priority' | 'date'>) => {
    const id = `#T-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabase.from('support_tickets').insert([{
      ...ticketData,
      id,
      status: 'Open',
      priority: 'Medium'
    }]);
    if (error) console.error('Error adding ticket:', error);
    fetchTickets();
  };

  const updateTicketStatus = async (id: string, status: SupportTicket['status']) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id);
    if (error) console.error('Error updating ticket status:', error);
    fetchTickets();
  };

  return (
    <SupportContext.Provider value={{ tickets, isLoading, addTicket, updateTicketStatus }}>
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};
