
import React, { useState, useEffect, useCallback } from 'react';
import { PROFILES } from '../constants';
import { useSiteConfig } from '../SiteConfigContext';
import { useReports } from '../ReportContext';

const SwipeView: React.FC = () => {
  const { config } = useSiteConfig();
  const { addReport } = useReports();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState<number[]>([]); // To track history for rewind

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (direction || showReportModal) return; // Block input during animation or modal
    
    switch (e.key) {
      case 'ArrowLeft':
        handleSwipe('left');
        break;
      case 'ArrowRight':
        handleSwipe('right');
        break;
      case 'ArrowUp':
        handleSwipe('up');
        break;
      case 'ArrowDown':
        handleRewind();
        break;
      case ' ':
        setShowDetails(prev => !prev);
        break;
    }
  }, [direction, currentIndex, showReportModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSwipe = (dir: 'left' | 'right' | 'up') => {
    if (direction || currentIndex >= PROFILES.length) return;

    setDirection(dir);
    
    // Add current index to history before moving
    setHistory(prev => [...prev, currentIndex]);

    // Wait for animation to finish
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setShowDetails(false); // Reset details view
    }, 400);
  };

  const handleRewind = () => {
    if (history.length === 0 || direction) return;
    
    const previousIndex = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(previousIndex);
    setShowDetails(false);
  };

  const currentProfile = PROFILES[currentIndex];

  const handleReportSubmit = () => {
    if (!reportReason || !currentProfile) return;
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Send report to global context
        addReport(currentProfile.name, currentProfile.image, reportReason);

        setIsSubmitting(false);
        setShowReportModal(false);
        setReportReason('');
        setShowDetails(false); // Close details panel
        
        // Show success feedback
        alert('রিপোর্ট জমা দেওয়া হয়েছে। আমরা শীঘ্রই ব্যবস্থা নিব।');
        
        // Automatically swipe left (reject) the reported profile
        handleSwipe('left');
    }, 1500);
  };

  const nextProfile = PROFILES[currentIndex + 1];

  // Empty State
  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-surface-dark/50 animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 relative">
           <span className="material-icons-round text-5xl text-gray-300 dark:text-gray-600">person_off</span>
           <div className="absolute -bottom-2 -right-2 bg-white dark:bg-surface-dark rounded-full p-1">
             <span className="material-icons-round text-2xl text-yellow-500">radar</span>
           </div>
        </div>
        <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white mb-2">আর কেউ নেই!</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
          আপনার এলাকার সব প্রোফাইল দেখা শেষ। প্রিমিয়াম মেম্বারশিপে আপনি অন্য এলাকার প্রোফাইল দেখতে পারবেন।
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => setCurrentIndex(0)} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              শুরু থেকে দেখুন
            </button>
            <button className="bg-gradient-to-r from-primary to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform">
              গ্লোবাল সার্চ চালু করুন
            </button>
        </div>
      </div>
    );
  }

  // Animation Classes
  const getCardStyle = () => {
    if (!direction) return {};
    const rotate = direction === 'left' ? -20 : direction === 'right' ? 20 : 0;
    const x = direction === 'left' ? -200 : direction === 'right' ? 200 : 0;
    const y = direction === 'up' ? -200 : 0;
    const opacity = 0;

    return {
      transform: `translate(${x}%, ${y}%) rotate(${rotate}deg)`,
      opacity: opacity,
      transition: 'transform 0.4s ease-out, opacity 0.4s ease-out'
    };
  };

  const activityStatus = currentProfile.isOnline ? 'Active Now' : (currentProfile.lastActive ? `Active ${currentProfile.lastActive}` : '');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-background-light dark:bg-background-dark md:bg-white md:dark:bg-surface-dark transition-colors duration-300 overflow-hidden relative">
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">কেন আপনি {currentProfile.name}-এর বিরুদ্ধে রিপোর্ট করতে চান?</p>
                    <div className="space-y-2">
                        {['Harassment / অশালীন আচরণ', 'Fake Profile / ফেইক আইডি', 'Spam / স্ক্যাম', 'Inappropriate Content / খারাপ ছবি', 'Underage / অপ্রাপ্তবয়স্ক'].map((r) => (
                            <label key={r} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="reportReason" 
                                    value={r}
                                    checked={reportReason === r}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="text-primary focus:ring-primary w-4 h-4 border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{r}</span>
                            </label>
                        ))}
                    </div>
                    <button 
                        onClick={handleReportSubmit}
                        disabled={!reportReason || isSubmitting}
                        className="w-full mt-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                             <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                প্রসেসিং...
                             </>
                        ) : 'রিপোর্ট জমা দিন'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Layout Container */}
      <div className="flex flex-col w-full h-full max-w-md md:max-w-xl md:max-h-[85vh] relative pb-2 md:pb-6">
          
          {/* Card Area (Flex Grow) */}
          <div className="flex-1 relative w-full mb-6">
              
              {/* Next Card (Background Stack) */}
              {nextProfile && (
                <div className="absolute inset-0 top-0 translate-y-2 scale-[0.96] z-0 opacity-100 transition-all duration-300">
                   <div className="w-full h-full bg-white dark:bg-surface-dark rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                      <img src={nextProfile.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40"></div> {/* Dimmer */}
                   </div>
                </div>
              )}

              {/* Current Card (Active) */}
              <div 
                className="absolute inset-0 z-20 w-full h-full bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 select-none"
                style={getCardStyle()}
              >
                {/* Image Layer */}
                <div className={`relative w-full h-full transition-all duration-300 ${showDetails ? 'h-[40%]' : 'h-full'}`}>
                  <img src={currentProfile.image} alt={currentProfile.name} className="w-full h-full object-cover pointer-events-none" />
                  
                  {/* Gradient Overlay (Only visible when details not expanded) */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${showDetails ? 'opacity-0' : 'opacity-100'}`}></div>

                  {/* Action Stamps */}
                  {direction === 'right' && (
                    <div className="absolute top-8 left-8 border-4 border-green-500 rounded-lg px-4 py-2 transform -rotate-12 z-50">
                      <span className="text-4xl font-bold text-green-500 uppercase tracking-widest">LIKE</span>
                    </div>
                  )}
                  {direction === 'left' && (
                    <div className="absolute top-8 right-8 border-4 border-red-500 rounded-lg px-4 py-2 transform rotate-12 z-50">
                      <span className="text-4xl font-bold text-red-500 uppercase tracking-widest">NOPE</span>
                    </div>
                  )}
                  {direction === 'up' && (
                    <div className="absolute bottom-32 left-0 right-0 text-center z-50">
                      <span className="text-4xl font-bold text-blue-400 uppercase tracking-widest shadow-black drop-shadow-lg">SUPER LIKE</span>
                    </div>
                  )}

                  {/* Basic Info Overlay (Visible when NOT expanded) */}
                  <div className={`absolute bottom-0 left-0 w-full p-6 text-white transition-opacity duration-300 ${showDetails ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-end justify-between mb-1">
                        <h2 className="font-display text-4xl font-bold drop-shadow-md flex items-center gap-2">
                            {currentProfile.name}, {currentProfile.age}
                            {currentProfile.isVerified && <span className="material-icons-round text-blue-400 text-xl" title="Verified">verified</span>}
                        </h2>
                        <button 
                            onClick={() => setShowDetails(true)} 
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full transition-colors"
                            title="View Details"
                        >
                            <span className="material-icons-round text-white">info</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-200 text-sm mb-2 font-medium drop-shadow-sm">
                        {currentProfile.isOnline && <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white/50"></span>}
                        {currentProfile.distance} away
                    </div>
                  </div>
                </div>

                {/* Details Panel (Slides Up) */}
                <div className={`absolute bottom-0 left-0 w-full bg-white dark:bg-surface-dark transition-all duration-300 ease-in-out flex flex-col ${showDetails ? 'h-[65%] rounded-t-3xl pt-2' : 'h-0 opacity-0'}`}>
                    <div className="w-full flex justify-center py-2 cursor-pointer" onClick={() => setShowDetails(false)}>
                        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
                        <div className="flex justify-between items-start mb-4 mt-2">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-white font-display">
                                    {currentProfile.name} <span className="font-normal text-2xl">{currentProfile.age}</span>
                                </h2>
                                {currentProfile.education && (
                                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                        <span className="material-icons-round text-sm">school</span> {currentProfile.education}
                                    </p>
                                )}
                                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <span className="material-icons-round text-sm">location_on</span> {currentProfile.location}
                                </p>
                                {/* Activity Status */}
                                {activityStatus && (
                                    <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${currentProfile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {activityStatus}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setShowDetails(false)} className="bg-gradient-to-br from-primary to-rose-600 rounded-full p-3 shadow-lg transform translate-y-[-20px]">
                                <span className="material-icons-round text-white text-xl">arrow_downward</span>
                            </button>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-700 mb-4" />

                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About Me</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                            {currentProfile.bio || "No bio available."}
                        </p>

                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Interests</h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {config.interests.slice(0, 5).map((interest, i) => ( 
                                <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-600">
                                    {interest}
                                </span>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setShowReportModal(true)}
                            className="w-full py-3 mt-2 text-red-500 font-bold text-sm bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round">flag</span> Report Profile
                        </button>
                    </div>
                </div>
              </div>
          </div>

          {/* Controls Bar (Fixed Layout Below Card) */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 sm:gap-6 z-30">
            {/* Rewind */}
            <button 
              onClick={handleRewind}
              disabled={history.length === 0} 
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-yellow-500 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Rewind"
            >
              <span className="material-icons-round text-2xl">replay</span>
            </button>

            {/* Nope */}
            <button 
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 text-red-500 shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
              title="Nope (Left Arrow)"
            >
              <span className="material-icons-round text-4xl">close</span>
            </button>

            {/* Super Like */}
            <button 
              onClick={() => handleSwipe('up')}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-blue-500 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              title="Super Like (Up Arrow)"
            >
              <span className="material-icons-round text-2xl">star</span>
            </button>

            {/* Like */}
            <button 
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white shadow-xl shadow-rose-500/40 flex items-center justify-center hover:scale-110 hover:shadow-rose-500/60 active:scale-95 transition-all"
              title="Like (Right Arrow)"
            >
              <span className="material-icons-round text-4xl">favorite</span>
            </button>
          </div>
      </div>
    </div>
  );
};

export default SwipeView;
