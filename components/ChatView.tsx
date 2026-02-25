
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_MESSAGES, MOCK_CHATS, PROFILES } from '../constants';
import { Message, UserProfile } from '../types';
import { encryptionService } from '../services/EncryptionService';
import { useReports } from '../ReportContext';

const RANDOM_RESPONSES = [
  "তাই নাকি? 😮",
  "হাহা, ঠিক বলেছেন! 😂",
  "তারপর কি হলো?",
  "আমিও তাই ভাবছিলাম। 🤔",
  "এখন কোথায় আপনি?",
  "বাহ, দারুণ তো! 👍",
  "আজকে আবহাওয়াটা জাস্ট ওয়াও তাই না? 🌧️",
  "আচ্ছা, পরে কথা বলি? একটু ব্যস্ত। 👋",
  "হুম... বুঝতে পেরেছি।",
  "কি করছেন এখন?"
];

const ChatView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addReport } = useReports();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSessionReady, setIsSessionReady] = useState(false);
  
  // Menu & Modal States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile modal
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Find basic user details from chat or profiles
  const chatUser = MOCK_CHATS.find(c => c.user.id === id)?.user || 
                   PROFILES.find(p => p.id === id) || 
                   { name: 'Unknown User', image: 'https://i.pravatar.cc/150', isOnline: false, lastActive: 'Offline' };

  // Construct full profile for the modal
  const fullProfile = PROFILES.find(p => p.id === id);
  // Fallback profile if user is not in PROFILES list but exists in MOCK_CHATS
  const displayProfile: UserProfile = fullProfile || {
      id: id || 'unknown',
      name: chatUser.name,
      image: chatUser.image,
      isOnline: chatUser.isOnline,
      lastActive: chatUser.lastActive,
      // Defaults for missing fields
      age: 24, 
      location: 'Rajshahi', 
      distance: '2 km', 
      bio: 'Hey there! I am using Tole Tole Chole.', 
      interests: ['Music', 'Travel', 'Movies', 'Food'],
      username: chatUser.name.toLowerCase().replace(/\s/g, ''),
      religion: 'Islam',
      education: 'Rajshahi College'
  };

  // --- E2EE Session Setup ---
  useEffect(() => {
    const setupSecureSession = async () => {
      if (!id) return;
      
      // 1. Initialize my identity
      await encryptionService.init();
      
      // 2. Handshake with the target user
      await encryptionService.establishSession(id);
      
      setIsSessionReady(true);
      
      // Load initial messages
      setMessages(MOCK_MESSAGES);
    };

    setupSecureSession();
  }, [id]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Actions ---
  const handleReportSubmit = () => {
    if (!reportReason) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        // Submit report to global context
        addReport(chatUser.name, chatUser.image, reportReason);

        setIsSubmitting(false);
        setShowReportModal(false);
        setReportReason('');
        setIsMenuOpen(false);
        alert('রিপোর্ট জমা দেওয়া হয়েছে। আমরা শীঘ্রই ব্যবস্থা নিব।');
    }, 1500);
  };

  const handleBlockConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        setIsSubmitting(false);
        setShowBlockModal(false);
        setIsMenuOpen(false);
        navigate('/app/chat'); // Redirect to inbox
        alert(`${chatUser.name}-কে ব্লক করা হয়েছে।`);
    }, 1000);
  };

  // --- Sending Logic ---
  const handleSend = async () => {
    if (inputText.trim() && id) {
      // 1. Encrypt Message
      const encrypted = await encryptionService.encrypt(id, inputText);

      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText, // Local optimistic update (store plaintext for self)
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSeen: false, // Default
        status: 'sent', // Initial status
        isEncrypted: true,
        encryptedContent: encrypted.ciphertext,
        iv: encrypted.iv
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Simulate Delivery Status (Sent -> Delivered -> Seen)
      setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
      }, 1000);

      setTimeout(() => {
          setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'seen', isSeen: true } : m));
      }, 2500);

      // --- SIMULATION: Trigger an encrypted reply ---
      setTimeout(async () => {
        // Pick a random natural response instead of echoing
        const replyText = RANDOM_RESPONSES[Math.floor(Math.random() * RANDOM_RESPONSES.length)];
        const replyEncrypted = await encryptionService.simulateReply(id, replyText);
        
        const replyMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'them',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isEncrypted: true,
            encryptedContent: replyEncrypted.ciphertext,
            iv: replyEncrypted.iv
        };
        
        setMessages(prev => [...prev, replyMsg]);
      }, 3500); // Slightly delayed to allow 'seen' status to settle
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- Message Bubble with Decryption ---
  const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const [content, setContent] = useState<string>(msg.text || '');
    const [isDecrypted, setIsDecrypted] = useState(false);

    useEffect(() => {
        // Automatically decrypt if message is from 'them' and encrypted
        const processMessage = async () => {
            if (msg.sender === 'them' && msg.isEncrypted && msg.encryptedContent && msg.iv && id) {
                const plain = await encryptionService.decrypt(id, msg.encryptedContent, msg.iv);
                setContent(plain);
                setIsDecrypted(true);
            }
        };
        processMessage();
    }, [msg, id]);

    return (
        <div className={`flex gap-2 items-end ${msg.sender === 'me' ? 'justify-end' : ''} group`}>
            {msg.sender === 'them' && (
                <img src={chatUser.image as string} alt="Sender" className="w-8 h-8 rounded-full object-cover mb-1 shadow-sm" />
            )}
            <div className={`flex flex-col gap-1 max-w-[75%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble */}
                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm font-display leading-relaxed border relative transition-all duration-300 ${
                    msg.sender === 'me' 
                    ? 'bg-primary text-white rounded-br-sm border-primary' 
                    : 'bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-200 rounded-bl-sm border-gray-100 dark:border-gray-700'
                }`}>
                    {msg.isEncrypted && msg.sender === 'them' && !isDecrypted ? (
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="material-icons-round text-sm animate-spin">sync</span>
                            <span className="text-xs">Decrypting...</span>
                        </div>
                    ) : (
                        content
                    )}

                    {/* Encryption Lock Icon */}
                    {msg.isEncrypted && (
                        <div 
                            className={`absolute -bottom-1.5 ${msg.sender === 'me' ? '-left-1.5' : '-right-1.5'} w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10 ${
                                msg.sender === 'me' ? 'bg-white text-primary' : 'bg-primary text-white'
                            }`} 
                            title="Signal Protocol Encrypted"
                        >
                            <span className="material-icons-round text-[10px]">lock</span>
                        </div>
                    )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] text-gray-400 font-sans">{msg.timestamp}</span>
                    {msg.sender === 'me' && (
                        <span title={msg.status || (msg.isSeen ? 'seen' : 'sent')}>
                            {/* Sent: Single Check, Delivered: Double Check (Gray), Seen: Double Check (Blue/Primary) */}
                            {msg.status === 'seen' || msg.isSeen ? (
                                <span className="material-icons-round text-[14px] text-primary">done_all</span>
                            ) : msg.status === 'delivered' ? (
                                <span className="material-icons-round text-[14px] text-gray-400">done_all</span>
                            ) : (
                                <span className="material-icons-round text-[14px] text-gray-400">check</span>
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
  };

  // Determine Activity Status text
  const activityStatus = chatUser.isOnline ? 'Active now' : (chatUser.lastActive || 'Offline');

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-surface-dark w-full relative">
      
      {/* --- MODALS --- */}
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
                    <h3 className="font-bold text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                        <span className="material-icons-round">report_problem</span> রিপোর্ট করুন
                    </h3>
                    <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">কেন আপনি {chatUser.name}-এর বিরুদ্ধে রিপোর্ট করতে চান?</p>
                    <div className="space-y-2">
                        {['Harassment / অশালীন আচরণ', 'Fake Profile / ফেইক আইডি', 'Spam / স্ক্যাম', 'Inappropriate Content / খারাপ ছবি'].map((r) => (
                            <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="reportReason" 
                                    value={r}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{r}</span>
                            </label>
                        ))}
                    </div>
                    <button 
                        onClick={handleReportSubmit}
                        disabled={!reportReason || isSubmitting}
                        className="w-full mt-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center"
                    >
                        {isSubmitting ? 'প্রসেসিং...' : 'রিপোর্ট জমা দিন'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-round text-3xl text-red-500">block</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">ব্লক করতে চান?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    আপনি <b>{chatUser.name}</b>-কে ব্লক করলে তিনি আর আপনাকে কোনো মেসেজ পাঠাতে পারবেন না।
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowBlockModal(false)}
                        className="flex-1 py-3 font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        বাতিল
                    </button>
                    <button 
                        onClick={handleBlockConfirm}
                        className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
                    >
                        {isSubmitting ? '...' : 'ব্লক করুন'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowProfileModal(false)}>
            <div 
                className="bg-white dark:bg-surface-dark w-full max-w-sm md:max-w-md rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                {/* Image Header */}
                <div className="relative h-72 shrink-0">
                    <img src={displayProfile.image} className="w-full h-full object-cover" alt={displayProfile.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    <button 
                        onClick={() => setShowProfileModal(false)} 
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                    >
                        <span className="material-icons-round">close</span>
                    </button>

                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <h2 className="text-3xl font-display font-bold flex items-center gap-2">
                            {displayProfile.name}, {displayProfile.age}
                            {displayProfile.isVerified && <span className="material-icons-round text-blue-400 text-xl" title="Verified">verified</span>}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm opacity-90 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                                <span className="material-icons-round text-sm">location_on</span> {displayProfile.location}
                            </span>
                            {displayProfile.isOnline && (
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
                            <span className="block text-xl font-bold text-gray-800 dark:text-white">{Math.floor(Math.random() * 50) + 10}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Matches</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-primary">{Math.floor(Math.random() * 500) + 50}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Likes</span>
                        </div>
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <span className="block text-xl font-bold text-gray-800 dark:text-white">{displayProfile.age}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Years</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Username</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">@{displayProfile.username}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Religion</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{displayProfile.religion}</span>
                            </div>
                            {displayProfile.education && (
                                <div className="col-span-2 flex flex-col pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Education</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1">
                                        <span className="material-icons-round text-sm">school</span> {displayProfile.education}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                            {displayProfile.bio}
                        </p>
                    </div>

                    {displayProfile.interests && displayProfile.interests.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {displayProfile.interests.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button 
                            onClick={() => { setShowProfileModal(false); setShowReportModal(true); }}
                            className="py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round text-yellow-500">flag</span> Report
                        </button>
                        <button 
                            onClick={() => { setShowProfileModal(false); setShowBlockModal(true); }}
                            className="py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-500 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round">block</span> Block
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Container */}
      <div className="flex flex-col h-full w-full md:max-w-2xl mx-auto md:border-x md:border-gray-100 md:dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app/chat')} className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
               <span className="material-icons-round">arrow_back</span>
            </button>
            <div className="relative cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <img src={chatUser.image as string} alt={chatUser.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
              {chatUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-surface-dark"></div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 cursor-pointer" onClick={() => setShowProfileModal(true)}>
                  {chatUser.name} 
                  {isSessionReady && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] px-1.5 rounded font-sans font-bold flex items-center gap-0.5" title="Signal Protocol Session Active">
                          <span className="material-icons-round text-[10px]">shield</span>
                      </span>
                  )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                 {chatUser.isOnline && <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>}
                 {activityStatus}
                 <span className="text-[8px] opacity-60">• E2EE</span>
              </p>
            </div>
          </div>
          
          {/* Three Dot Menu */}
          <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <span className="material-icons-round">more_vert</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up origin-top-right z-30">
                    <button 
                        onClick={() => { setShowProfileModal(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                        <span className="material-icons-round text-primary">person</span> প্রোফাইল দেখুন
                    </button>
                    <button 
                        onClick={() => { setShowReportModal(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                        <span className="material-icons-round text-yellow-500">flag</span> রিপোর্ট করুন
                    </button>
                    <button 
                        onClick={() => { setShowBlockModal(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <span className="material-icons-round">block</span> ব্লক করুন
                    </button>
                </div>
              )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-black/20">
          
          {/* Encryption Notice */}
          <div className="flex justify-center my-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-400 text-xs px-4 py-2 rounded-xl text-center max-w-xs shadow-sm">
                <span className="material-icons-round text-sm block mb-1">lock</span>
                Messages to this chat and calls are now secured with end-to-end encryption.
            </div>
          </div>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center px-4 py-2 border border-transparent focus-within:border-primary/30 transition-colors">
              <input 
                className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 font-display placeholder-gray-400 focus:ring-0 px-0" 
                placeholder="Message..." 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isSessionReady}
              />
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="material-icons-round">sentiment_satisfied</span>
              </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!isSessionReady || !inputText.trim()}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
            >
              <span className="material-icons-round">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
