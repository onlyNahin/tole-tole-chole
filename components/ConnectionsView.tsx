
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_CONNECTION_REQUESTS, MOCK_FRIENDS_LIST } from '../constants';
import { UserProfile } from '../types';

const ConnectionsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
  
  // State for requests and friends
  const [requests, setRequests] = useState(MOCK_CONNECTION_REQUESTS);
  const [friends, setFriends] = useState<UserProfile[]>(MOCK_FRIENDS_LIST);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  // Handlers
  const handleAccept = (req: any) => {
    // Move from requests to friends
    const newFriend: UserProfile = {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        image: req.user.image,
        location: req.user.location,
        age: req.user.age,
        isOnline: true,
        distance: '0 km',
        bio: 'New Friend',
        religion: 'Islam', // Default for new friends from mock
        interests: ['Music', 'Travel'] // Default interests
    };
    setFriends(prev => [newFriend, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    if (selectedProfile) setSelectedProfile(null); // Close modal if open
  };

  const handleDecline = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    if (selectedProfile) setSelectedProfile(null); // Close modal if open
  };

  const handleUnfriend = (e: React.MouseEvent | null, id: string, name: string) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if(window.confirm(`আপনি কি নিশ্চিত যে আপনি ${name}-কে আনফ্রেন্ড করতে চান?`)) {
        setFriends(prev => prev.filter(f => f.id !== id));
        if (selectedProfile) setSelectedProfile(null); // Close modal if open
    }
  };

  const handleViewRequestProfile = (req: any) => {
      // Create a fuller profile for the view, mocking missing data for requests
      const profile: UserProfile = {
          id: req.user.id,
          name: req.user.name,
          username: req.user.username || req.user.name.toLowerCase().replace(/\s/g, ''),
          image: req.user.image,
          location: req.user.location,
          age: req.user.age,
          distance: '2 km', 
          bio: 'Hey, I sent you a connection request! Looking forward to chatting.', 
          isOnline: false,
          interests: ['Music', 'Travel', 'Adda'], // Mock interests
          education: 'Rajshahi University', // Mock education
          religion: 'Islam' // Mock religion
      };
      setSelectedProfile(profile);
  };

  const handleViewFriendProfile = (friend: UserProfile) => {
      // Ensure friend profile has necessary fields for display
      const profile: UserProfile = {
          ...friend,
          username: friend.username || friend.name.toLowerCase().replace(/\s/g, ''),
          interests: friend.interests && friend.interests.length > 0 ? friend.interests : ['Music', 'Travel', 'Adda', 'Food'], // Fallback interests
          education: friend.education || 'Rajshahi University', // Fallback
          religion: friend.religion || 'Islam' // Fallback
      };
      setSelectedProfile(profile);
  };

  // Filter Friends
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (friend.username && friend.username.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Determine modal actions based on relationship status
  const isFriend = selectedProfile && friends.some(f => f.id === selectedProfile.id);
  const associatedRequest = selectedProfile && requests.find(r => r.user.id === selectedProfile.id);

  // Helper to get random stats for display
  const getRandomStats = () => ({
      likes: Math.floor(Math.random() * 500) + 50,
      matches: Math.floor(Math.random() * 50) + 10
  });

  const stats = selectedProfile ? getRandomStats() : { likes: 0, matches: 0 };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background-dark md:bg-white md:dark:bg-surface-dark relative">
      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedProfile(null)}>
            <div 
                className="bg-white dark:bg-surface-dark w-full max-w-sm md:max-w-md rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Image Header */}
                <div className="relative h-72 shrink-0">
                    <img src={selectedProfile.image} className="w-full h-full object-cover" alt={selectedProfile.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                    
                    <button 
                        onClick={() => setSelectedProfile(null)} 
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                    >
                        <span className="material-icons-round">close</span>
                    </button>

                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <h2 className="text-3xl font-display font-bold flex items-center gap-2">
                            {selectedProfile.name}, {selectedProfile.age}
                            {selectedProfile.isVerified && <span className="material-icons-round text-blue-400 text-xl" title="Verified">verified</span>}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm opacity-90 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                <span className="material-icons-round text-sm">location_on</span> {selectedProfile.location}
                            </span>
                            {selectedProfile.isOnline && (
                                <span className="text-xs font-bold bg-green-500/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Online
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    
                    {/* Stats Row */}
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="text-center">
                            <span className="block text-xl font-bold text-gray-800 dark:text-white">{stats.matches}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Matches</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-primary">{stats.likes}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Likes</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-gray-800 dark:text-white">{selectedProfile.age}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Years</span>
                        </div>
                    </div>

                    {/* Detailed Info Box */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Username</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">@{selectedProfile.username || selectedProfile.name.toLowerCase().replace(/\s/g, '')}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Religion</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedProfile.religion || 'Islam'}</span>
                            </div>
                            {selectedProfile.education && (
                                <div className="col-span-2 flex flex-col pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Education</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1">
                                        <span className="material-icons-round text-sm">school</span> {selectedProfile.education}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                            {selectedProfile.bio || "No bio available."}
                        </p>
                    </div>

                    {(selectedProfile.interests && selectedProfile.interests.length > 0) ? (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedProfile.interests.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                    
                    {/* Action Buttons based on Relationship */}
                    {isFriend ? (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button 
                                onClick={() => { setSelectedProfile(null); navigate(`/app/chat/${selectedProfile.id}`); }}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span className="material-icons-round">chat_bubble</span> Message
                            </button>
                            <button 
                                onClick={(e) => { 
                                    handleUnfriend(null, selectedProfile.id, selectedProfile.name); 
                                }}
                                className="bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-200 hover:text-red-500 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                            >
                                <span className="material-icons-round">person_remove</span> Unfriend
                            </button>
                        </div>
                    ) : associatedRequest ? (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button 
                                onClick={() => handleAccept(associatedRequest)}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span className="material-icons-round">check_circle</span> Confirm
                            </button>
                            <button 
                                onClick={() => handleDecline(associatedRequest.id)}
                                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
                            >
                                <span className="material-icons-round">cancel</span> Delete
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4">
                             <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed">
                                 Not Connected
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark sticky top-0 z-10">
        <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-white mb-4">Connections</h1>
        
        {/* Search & Tabs Container */}
        <div className="space-y-3">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">search</span>
                <input 
                    type="text" 
                    placeholder="Search connections..." 
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 text-gray-800 dark:text-white transition-all"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        activeTab === 'all' 
                        ? 'bg-white dark:bg-surface-dark shadow text-primary' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    My Connections ({friends.length})
                </button>
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                        activeTab === 'requests' 
                        ? 'bg-white dark:bg-surface-dark shadow text-primary' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    Requests
                    {requests.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                            {requests.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        
        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
            <div className="space-y-4 animate-fade-in">
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-icons-round text-5xl mb-2 opacity-30">person_add_disabled</span>
                        <p className="text-sm">No pending requests</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div 
                            key={req.id} 
                            onClick={() => handleViewRequestProfile(req)}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm cursor-pointer hover:border-primary/30 transition-colors group"
                        >
                            <img src={req.user.image} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-600" alt={req.user.name} />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-800 dark:text-white text-sm group-hover:text-primary transition-colors">{req.user.name} <span className="font-normal text-xs text-gray-500 dark:text-gray-400">sent a request</span></h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span className="material-icons-round text-[10px]">place</span> {req.user.location} • {req.timestamp}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAccept(req); }} 
                                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDecline(req.id); }} 
                                    className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* ALL CONNECTIONS TAB */}
        {activeTab === 'all' && (
            <div className="space-y-1 animate-fade-in">
                {filteredFriends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-icons-round text-5xl mb-2 opacity-30">group_off</span>
                        <p className="text-sm">No connections found</p>
                    </div>
                ) : (
                    filteredFriends.map(friend => (
                        <div 
                            key={friend.id} 
                            onClick={() => navigate(`/app/chat/${friend.id}`)}
                            className="relative flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-surface-dark/50 transition-colors border border-transparent md:hover:border-gray-200 md:dark:hover:border-gray-700 group cursor-pointer"
                        >
                            <div className="relative">
                                <img src={friend.image} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-700" alt={friend.name} />
                                {friend.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1">
                                    {friend.name}
                                    {friend.isOnline && <span className="text-[10px] font-normal text-green-500 bg-green-100 dark:bg-green-900/30 px-1.5 rounded-full">Online</span>}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {friend.location}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); navigate(`/app/chat/${friend.id}`); }}
                                    className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    title="Message"
                                >
                                    <span className="material-icons-round text-lg">chat_bubble</span>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleViewFriendProfile(friend); }}
                                    className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                    title="View Profile"
                                >
                                    <span className="material-icons-round text-lg">person</span>
                                </button>
                                <button 
                                    onClick={(e) => handleUnfriend(e, friend.id, friend.name)}
                                    className="relative z-20 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
                                    title="Unfriend"
                                >
                                    <span className="material-icons-round text-lg pointer-events-none">person_remove</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsView;
