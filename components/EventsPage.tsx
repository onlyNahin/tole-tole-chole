
import React, { useState } from 'react';
import { useEvents } from '../EventContext';
import { AppEvent } from '../types';

const EventsPage: React.FC = () => {
  const { events, updateEvent } = useEvents();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const filteredEvents = events.filter(event => 
    activeTab === 'upcoming' 
      ? event.status === 'Upcoming' 
      : event.status === 'Past'
  );

  const handleJoinEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedEvent) return;

    const isJoining = !selectedEvent.isJoined;
    
    const updatedEvent = {
        ...selectedEvent,
        isJoined: isJoining,
        attendees: selectedEvent.attendees + (isJoining ? 1 : -1)
    };

    updateEvent(updatedEvent);
    setSelectedEvent(updatedEvent);

    // Optional: You could verify auth here before allowing join
    if (isJoining) {
        // alert(`Success! You have joined "${selectedEvent.title}".`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-background-dark md:bg-white md:dark:bg-surface-dark relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark sticky top-0 z-10 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-white">Local Events</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Join the community in Rajshahi</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === 'upcoming' 
                    ? 'bg-white dark:bg-surface-dark shadow text-primary' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
            >
                Upcoming
            </button>
            <button 
                onClick={() => setActiveTab('past')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === 'past' 
                    ? 'bg-white dark:bg-surface-dark shadow text-primary' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
            >
                Past
            </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="material-icons-round text-5xl mb-2 opacity-30">event_busy</span>
                <p className="text-sm">No {activeTab} events found</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                    <div 
                        key={event.id} 
                        className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                        onClick={() => setSelectedEvent(event)}
                    >
                        <div className="relative h-40">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[50px] shadow-sm">
                                <span className="block text-xs font-bold text-red-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="block text-lg font-bold text-gray-800 dark:text-white leading-none">{new Date(event.date).getDate()}</span>
                            </div>
                            <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                {event.category}
                            </div>
                            {event.isJoined && (
                                <div className="absolute bottom-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <span className="material-icons-round text-xs">check</span> Joined
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 line-clamp-1">{event.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <span className="material-icons-round text-sm">schedule</span> {event.time} • 
                                <span className="material-icons-round text-sm ml-1">place</span> {event.location}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <img key={i} src={`https://i.pravatar.cc/150?u=${event.id}${i}`} className="w-6 h-6 rounded-full border-2 border-white dark:border-surface-dark" alt="User" />
                                    ))}
                                    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-surface-dark flex items-center justify-center text-[8px] font-bold text-gray-500">
                                        +{event.attendees}
                                    </span>
                                </div>
                                <button className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition-colors ${event.isJoined ? 'text-green-600 bg-green-50' : 'text-primary hover:bg-primary/5'}`}>
                                    {event.isJoined ? 'Joined' : (event.status === 'Upcoming' ? 'Join Now' : 'View Details')}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedEvent(null)}>
            <div 
                className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-56 shrink-0">
                    <img src={selectedEvent.image} className="w-full h-full object-cover" alt={selectedEvent.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <button 
                        onClick={() => setSelectedEvent(null)} 
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 inline-block">
                            {selectedEvent.category}
                        </span>
                        <h2 className="text-3xl font-display font-bold">{selectedEvent.title}</h2>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-primary shadow-sm">
                                <span className="material-icons-round">calendar_today</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Date & Time</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedEvent.date} <br/> {selectedEvent.time}</p>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-secondary shadow-sm">
                                <span className="material-icons-round">location_on</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Location</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedEvent.location}</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">About Event</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                        {selectedEvent.description}
                    </p>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/150?u=${selectedEvent.id}${i}`} className="w-8 h-8 rounded-full border-2 border-white dark:border-surface-dark" alt="User" />
                                ))}
                            </div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">+{selectedEvent.attendees} attending</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Entry Fee</p>
                            <p className="text-lg font-bold text-primary">{selectedEvent.price}</p>
                        </div>
                    </div>

                    {selectedEvent.status === 'Upcoming' && (
                        <button 
                            onClick={handleJoinEvent}
                            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                selectedEvent.isJoined 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-primary hover:bg-primary-dark text-white shadow-primary/30'
                            }`}
                        >
                            {selectedEvent.isJoined ? (
                                <>
                                    <span className="material-icons-round">check</span> Joined
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-round">check_circle</span> Join Event
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
