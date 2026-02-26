import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppEvent } from './types';
import { MOCK_EVENTS } from './constants';
import { supabase } from './services/supabaseClient';

interface EventContextType {
  events: AppEvent[];
  isLoading: boolean;
  addEvent: (event: AppEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (updatedEvent: AppEvent) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } else {
      setEvents((data || []).map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        image: e.image_url,
        attendees: e.attendees_count,
        category: e.category,
        status: e.status,
        price: e.price
      } as AppEvent)));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (event: Omit<AppEvent, 'id'>) => {
    const { error } = await supabase.from('events').insert([{
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image_url: event.image,
      attendees_count: event.attendees,
      category: event.category,
      status: event.status,
      price: event.price
    }]);
    if (error) console.error('Error adding event:', error);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) console.error('Error deleting event:', error);
    fetchEvents();
  };

  const updateEvent = async (updatedEvent: AppEvent) => {
    const { error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', updatedEvent.id);
    if (error) console.error('Error updating event:', error);
    fetchEvents();
  };

  return (
    <EventContext.Provider value={{ events, isLoading, addEvent, deleteEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
