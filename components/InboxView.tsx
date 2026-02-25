
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_CHATS, PROFILES, ADMIN_USERS } from '../constants';
import { UserProfile } from '../types';

const InboxView: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  // Filter existing chats (Matches) based on name
  const filteredChats = MOCK_CHATS.filter(chat => 
    chat.user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Search Global Users (Simulated database search)
  // We combine PROFILES and ADMIN_USERS to simulate a larger user base.
  // CRITICAL: We must exclude users who are already in the chat list (already matched)
  const potentialUsers = [...PROFILES, ...ADMIN_USERS];
  
  const globalSearchResults = searchText.length > 0 ? potentialUsers.filter(user => {
    const matchesName = user.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesUsername = user.username && user.username.toLowerCase().includes(searchText.toLowerCase());
    const isAlreadyMatched = MOCK_CHATS.some(chat => chat.user.id === user.id);
    
    return (matchesName || matchesUsername) && !isAlreadyMatched;
  }) : [];

  // Remove duplicates from global search (in case IDs overlap or mock data issues)
  const uniqueGlobalResults = Array.from(new Map(globalSearchResults.map(item => [item.id, item])).values());

  const handleConnect = (userId: string) => {
    // Simulate sending a connection request
    setSentRequests(prev => [...prev, userId]);
    // In a real app, this would make an API call (e.g. POST /api/connect)
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background-dark md:bg-white md:dark:bg-surface-dark">
      {/* Search Header */}
      <div className="p-4 pb-2">
        <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-white mb-4">ম্যাচ এবং মেসেজ</h1>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Search matches or username..." 
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-surface-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white transition-all"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button 
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <span className="material-icons-round text-base">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* New Matches Section - Only show if not searching or if search yields matches */}
        {!searchText && (
            <div className="px-4 py-2">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">New Matches</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {/* Likes Card (Premium teaser) */}
                <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-secondary/10 border-2 border-dashed border-secondary flex items-center justify-center relative overflow-hidden group-hover:bg-secondary/20 transition-colors">
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10"></div>
                    <span className="material-icons-round text-secondary z-20">favorite</span>
                    <img src={PROFILES[0].image} className="absolute inset-0 object-cover opacity-50" alt="" />
                </div>
                <span className="text-[10px] font-bold text-secondary">Likes (12)</span>
                </div>

                {PROFILES.map(profile => (
                <Link key={profile.id} to={`/app/chat/${profile.id}`} className="flex flex-col items-center gap-1 min-w-[70px] group">
                    <div className="relative w-16 h-16 transition-transform group-hover:scale-105">
                    <img src={profile.image} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-surface-dark shadow-sm" alt={profile.name} />
                    {profile.isOnline && <div className="absolute bottom-1 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></div>}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">{profile.name}</span>
                </Link>
                ))}
            </div>
            </div>
        )}

        {/* Global Search Results Section */}
        {searchText && uniqueGlobalResults.length > 0 && (
            <div className="px-4 py-2 mb-2 animate-fade-in">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">People to Connect</h2>
                <div className="space-y-3">
                    {uniqueGlobalResults.map(user => {
                        const isRequested = sentRequests.includes(user.id);
                        return (
                            <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-surface-dark/30 border border-gray-100 dark:border-gray-700 hover:border-primary/20 transition-colors">
                                <div className="relative">
                                    <img src={user.image} className="w-12 h-12 rounded-full object-cover" alt={user.name} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">{user.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username || 'user'}</p>
                                </div>
                                <button 
                                    onClick={() => !isRequested && handleConnect(user.id)}
                                    disabled={isRequested}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        isRequested 
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default' 
                                        : 'bg-primary text-white hover:bg-primary-dark shadow-md active:scale-95'
                                    }`}
                                >
                                    {isRequested ? 'Requested' : 'Connect'}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-4"></div>
            </div>
        )}

        <div className="h-1 bg-gray-50 dark:bg-surface-dark/50 my-2"></div>

        {/* Messages List */}
        <div className="px-4">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
               {searchText ? 'Matching Conversations' : 'Messages'}
           </h2>
           
           {filteredChats.length === 0 && searchText && uniqueGlobalResults.length === 0 ? (
               <div className="text-center py-12 text-gray-400">
                   <span className="material-icons-round text-4xl mb-2 opacity-50">search_off</span>
                   <p className="text-sm">No users or messages found matching "{searchText}"</p>
               </div>
           ) : null}

           <div className="space-y-1 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
             {filteredChats.map(chat => (
               <Link key={chat.id} to={`/app/chat/${chat.user.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors border border-transparent md:hover:border-gray-200 md:dark:hover:border-gray-700">
                 <div className="relative">
                   <img src={chat.user.image} className="w-14 h-14 rounded-full object-cover" alt={chat.user.name} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-0.5">
                     <h3 className="font-bold text-gray-800 dark:text-white font-display text-base">{chat.user.name}</h3>
                     <span className={`text-[10px] font-medium ${chat.unreadCount > 0 ? 'text-primary' : 'text-gray-400'}`}>{chat.timestamp}</span>
                   </div>
                   <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                     {chat.lastMessage}
                   </p>
                 </div>
                 {chat.unreadCount > 0 && (
                   <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                     {chat.unreadCount}
                   </div>
                 )}
               </Link>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InboxView;
