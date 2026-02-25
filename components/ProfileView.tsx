import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSiteConfig } from '../SiteConfigContext';
import { useSupport } from '../SupportContext';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { config } = useSiteConfig();
  const { addTicket } = useSupport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Settings State
  const [distance, setDistance] = useState(15);
  const [ageRange, setAgeRange] = useState<[number, number]>([20, 30]);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  
  // App Settings Modal State
  const [activeModal, setActiveModal] = useState<'notifications' | 'language' | 'privacy' | 'support' | null>(null);
  
  // Notification Settings
  const [notifSettings, setNotifSettings] = useState({
      push: true,
      email: true,
      promo: false
  });

  // Language Settings
  const [language, setLanguage] = useState('Bangla');

  // Support Form State
  const [supportIssue, setSupportIssue] = useState('');
  const [isSupportSubmitting, setIsSupportSubmitting] = useState(false);

  // Slider Logic
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const minAge = 18;
  const maxAge = 60;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      
      // Calculate percentage
      let percent = (clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      
      const rawValue = Math.round(minAge + percent * (maxAge - minAge));
      
      setAgeRange(prev => {
        const [min, max] = prev;
        const gap = 1;
        
        if (isDragging === 'min') {
          const newValue = Math.min(Math.max(minAge, rawValue), max - gap);
          return [newValue, max];
        } else {
          const newValue = Math.max(Math.min(maxAge, rawValue), min + gap);
          return [min, newValue];
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  // Calculations for slider visuals
  const getPercent = (value: number) => ((value - minAge) / (maxAge - minAge)) * 100;
  const minPos = getPercent(ageRange[0]);
  const maxPos = getPercent(ageRange[1]);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: 'আরিফুর রহমান',
    age: 25,
    email: 'arif.demo@email.com',
    bio: 'Software Engineer @ Rajshahi',
    education: 'রাজশাহী বিশ্ববিদ্যালয়',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
    gallery: [] as string[],
    interests: ['💻 Tech', '🎮 Gaming', '✈️ Travel', '🎵 Music'] as string[]
  });

  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  // Gallery State
  const [targetGalleryIndex, setTargetGalleryIndex] = useState<number>(-1);

  // Security Modal State
  const [securityModal, setSecurityModal] = useState<{
    isOpen: boolean;
    type: 'email' | 'password' | null;
    step: 'input' | 'otp';
    tempData: any; 
  }>({
    isOpen: false,
    type: null,
    step: 'input',
    tempData: null
  });

  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Handlers ---

  // 1. Profile Picture Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Gallery Handlers
  const handleGalleryClick = (index: number) => {
    setTargetGalleryIndex(index);
    galleryInputRef.current?.click();
  }

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newImage = reader.result as string;
            setProfile(prev => {
                const newGallery = [...prev.gallery];
                if (targetGalleryIndex < newGallery.length) {
                    // Replace existing
                    newGallery[targetGalleryIndex] = newImage;
                } else {
                    // Add new
                    newGallery.push(newImage);
                }
                return { ...prev, gallery: newGallery };
            });
        };
        reader.readAsDataURL(file);
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  const removeGalleryImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if(window.confirm('Are you sure you want to remove this photo?')) {
        setProfile(prev => {
            const newGallery = prev.gallery.filter((_, i) => i !== index);
            return { ...prev, gallery: newGallery };
        });
    }
  }

  // 2. Basic Profile Edit
  const handleEditClick = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditing(false);
  };

  const toggleEditInterest = (interest: string) => {
    if (editForm.interests.includes(interest)) {
      setEditForm({ ...editForm, interests: editForm.interests.filter(i => i !== interest) });
    } else {
      if (editForm.interests.length < 5) {
        setEditForm({ ...editForm, interests: [...editForm.interests, interest] });
      } else {
        alert("Maximum 5 interests allowed");
      }
    }
  };

  // 3. Security Changes
  const openSecurityModal = (type: 'email' | 'password') => {
    setSecurityModal({
      isOpen: true,
      type,
      step: 'input',
      tempData: type === 'email' ? '' : { current: '', new: '', confirm: '' }
    });
    setOtp(['', '', '', '']);
    setOtpError('');
  };

  const handleSecurityInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityModal(prev => ({ ...prev, step: 'otp' }));
    setTimeout(() => {
        otpInputRefs.current[0]?.focus();
    }, 100);
  };

  // OTP Logic
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
    setOtpError('');
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtpAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length < 4) {
        setOtpError('দয়া করে ৪ সংখ্যার কোড দিন');
        return;
    }

    // Mock Verification Logic (use '1234')
    if (enteredOtp === '1234') { 
        if (securityModal.type === 'email') {
            setProfile(prev => ({ ...prev, email: securityModal.tempData }));
            alert('Email updated successfully!');
        } else {
            alert('Password updated successfully!');
        }
        setSecurityModal({ isOpen: false, type: null, step: 'input', tempData: null });
    } else {
        setOtpError('ভুল কোড! আবার চেষ্টা করুন (Use 1234)');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 4. Application Settings Handlers
  const handleSupportSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!supportIssue.trim()) return;
      setIsSupportSubmitting(true);
      setTimeout(() => {
          addTicket({
              name: profile.name,
              email: profile.email,
              issue: supportIssue,
          });
          setIsSupportSubmitting(false);
          setSupportIssue('');
          setActiveModal(null);
          alert('আপনার সমস্যাটি জমা দেওয়া হয়েছে। আমরা শীঘ্রই যোগাযোগ করবো।');
      }, 1500);
  };

  const interestList = config.interests || [];

  const settingsItems = [
    { 
        icon: 'notifications', 
        label: 'Notifications', 
        color: 'bg-red-100 text-red-600', 
        action: () => setActiveModal('notifications') 
    },
    { 
        icon: 'language', 
        label: 'Language', 
        value: language, 
        color: 'bg-blue-100 text-blue-600', 
        action: () => setActiveModal('language') 
    },
    { 
        icon: 'lock', 
        label: 'Privacy Policy', 
        color: 'bg-gray-100 text-gray-600', 
        action: () => setActiveModal('privacy') 
    },
    { 
        icon: 'help', 
        label: 'Help & Support', 
        color: 'bg-purple-100 text-purple-600', 
        action: () => setActiveModal('support') 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-background-dark md:bg-white md:dark:bg-surface-dark overflow-y-auto no-scrollbar pb-20 relative">
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleGalleryFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* --- MODALS --- */}
      
      {/* Application Settings Modals */}
      {activeModal === 'notifications' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
              <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">Notification Settings</h3>
                      <button onClick={() => setActiveModal(null)}><span className="material-icons-round text-gray-400">close</span></button>
                  </div>
                  <div className="p-4 space-y-4">
                      {[
                          { key: 'push', label: 'Push Notifications', desc: 'Receive messages and match alerts' },
                          { key: 'email', label: 'Email Updates', desc: 'Get weekly digests and offers' },
                          { key: 'promo', label: 'Promotional', desc: 'Updates about new features' },
                      ].map(item => (
                          <div key={item.key} className="flex items-center justify-between">
                              <div>
                                  <p className="font-bold text-gray-700 dark:text-gray-200">{item.label}</p>
                                  <p className="text-xs text-gray-500">{item.desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={(notifSettings as any)[item.key]}
                                      onChange={(e) => setNotifSettings(prev => ({...prev, [item.key]: e.target.checked}))}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeModal === 'language' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
              <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">Language / ভাষা</h3>
                      <button onClick={() => setActiveModal(null)}><span className="material-icons-round text-gray-400">close</span></button>
                  </div>
                  <div className="p-4 space-y-2">
                      {['Bangla', 'English'].map(lang => (
                          <button 
                              key={lang}
                              onClick={() => { setLanguage(lang); setActiveModal(null); }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border ${language === lang ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                          >
                              <span className="font-bold">{lang}</span>
                              {language === lang && <span className="material-icons-round text-primary">check_circle</span>}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeModal === 'privacy' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
              <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">Privacy Policy</h3>
                      <button onClick={() => setActiveModal(null)}><span className="material-icons-round text-gray-400">close</span></button>
                  </div>
                  <div className="p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <p className="mb-4"><strong>Effective Date:</strong> October 2023</p>
                      <p className="mb-2">At <strong>{config.appName}</strong>, we value your privacy. This policy outlines how we handle your data.</p>
                      <ul className="list-disc pl-5 space-y-2 mb-4">
                          <li>We collect information you provide directly, such as your name, email, and profile details.</li>
                          <li>Your location data is used solely to find matches near you and is only shared if you enable it.</li>
                          <li>We do not sell your personal data to third parties.</li>
                          <li>Messages are end-to-end encrypted for your security.</li>
                      </ul>
                      <p>By using our service, you agree to the collection and use of information in accordance with this policy.</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <button onClick={() => setActiveModal(null)} className="w-full bg-primary text-white font-bold py-3 rounded-xl">I Understand</button>
                  </div>
              </div>
          </div>
      )}

      {activeModal === 'support' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
              <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-purple-50 dark:bg-purple-900/20">
                      <h3 className="font-bold text-lg text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <span className="material-icons-round">support_agent</span> Help & Support
                      </h3>
                      <button onClick={() => setActiveModal(null)}><span className="material-icons-round text-gray-400">close</span></button>
                  </div>
                  <div className="p-5">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          কিভাবে আপনাকে সাহায্য করতে পারি? আপনার সমস্যা বা পরামর্শ নিচে লিখুন।
                      </p>
                      <form onSubmit={handleSupportSubmit}>
                          <textarea 
                              rows={4}
                              className="w-full rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 text-sm mb-4 resize-none dark:text-white"
                              placeholder="আপনার বার্তা লিখুন..."
                              value={supportIssue}
                              onChange={(e) => setSupportIssue(e.target.value)}
                              required
                          ></textarea>
                          <div className="flex gap-2">
                              <a href={`mailto:${config.aboutPage?.contactEmail}`} className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                  Email Us
                              </a>
                              <button 
                                  type="submit" 
                                  disabled={isSupportSubmitting}
                                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-center text-sm font-bold shadow-lg disabled:opacity-70"
                              >
                                  {isSupportSubmitting ? 'Sending...' : 'Send Message'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {isEditing && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[85vh]">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                 <h3 className="font-bold text-lg text-gray-800 dark:text-white">Edit Profile</h3>
                 <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <span className="material-icons-round">close</span>
                 </button>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto flex-1">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Age</label>
                    <input 
                      type="number" 
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
                      className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Education</label>
                    <input 
                      type="text" 
                      value={editForm.education || ''}
                      onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                      className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200"
                      placeholder="University or College"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bio / Job Title</label>
                    <textarea 
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200 resize-none"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Interests ({editForm.interests.length}/5)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {interestList.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleEditInterest(interest)}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                            editForm.interests.includes(interest)
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                 </div>
              </form>

              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                <button 
                  onClick={handleSaveProfile}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
         </div>
      )}

      {securityModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                        {securityModal.step === 'input' 
                            ? (securityModal.type === 'email' ? 'Change Email' : 'Change Password') 
                            : 'Verification'}
                    </h3>
                    <button onClick={() => setSecurityModal({...securityModal, isOpen: false})} className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-5">
                    {/* STEP 1: INPUT */}
                    {securityModal.step === 'input' && (
                        <form onSubmit={handleSecurityInputSubmit} className="space-y-4">
                            {securityModal.type === 'email' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200"
                                        placeholder="new@email.com"
                                        value={securityModal.tempData as string}
                                        onChange={(e) => setSecurityModal({...securityModal, tempData: e.target.value})}
                                    />
                                    <p className="text-xs text-gray-400 mt-2">We will send an OTP to <b>{profile.email}</b> to verify this change.</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Password</label>
                                        <input 
                                            type="password" required
                                            className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200"
                                            value={(securityModal.tempData as any).current}
                                            onChange={(e) => setSecurityModal({...securityModal, tempData: {...securityModal.tempData, current: e.target.value}})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Password</label>
                                        <input 
                                            type="password" required
                                            className="w-full text-sm rounded-xl border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 dark:text-gray-200"
                                            value={(securityModal.tempData as any).new}
                                            onChange={(e) => setSecurityModal({...securityModal, tempData: {...securityModal.tempData, new: e.target.value}})}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">For security, we will verify via OTP sent to your email.</p>
                                </>
                            )}
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg mt-2">
                                Send Verification Code
                            </button>
                        </form>
                    )}

                    {/* STEP 2: OTP */}
                    {securityModal.step === 'otp' && (
                        <form onSubmit={verifyOtpAndSave} className="space-y-6 text-center">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                                    We sent a 4-digit code to <br/><span className="font-bold text-gray-800 dark:text-white">{profile.email}</span>
                                </p>
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpInputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, index)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                            className="w-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-center text-xl font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-0 outline-none transition-all"
                                        />
                                    ))}
                                </div>
                                {otpError && <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">{otpError}</p>}
                            </div>
                            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg">
                                Verify & Update
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}


      {/* --- HEADER PROFILE SECTION --- */}
      <div className="relative bg-white dark:bg-surface-dark pb-8 md:rounded-b-[2.5rem] rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-primary to-orange-400 opacity-90 rounded-b-[50%] scale-x-150"></div>
        
        <div className="relative flex flex-col items-center pt-12 px-4">
          <div className="relative mb-4 group">
            <div className="w-28 h-28 p-1 bg-white dark:bg-surface-dark rounded-full shadow-xl relative overflow-visible">
               <img 
                 src={profile.image} 
                 alt="My Profile" 
                 className="w-full h-full rounded-full object-cover" 
               />
               <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-1">
                   <button 
                    onClick={triggerFileInput}
                    className="bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-surface-dark hover:scale-110 transition-transform cursor-pointer"
                    title="Change Profile Picture"
                   >
                    <span className="material-icons-round text-lg">add_a_photo</span>
                   </button>
               </div>
            </div>
          </div>
          
          <button 
            onClick={handleEditClick}
            className="mb-2 bg-white dark:bg-surface-dark/80 text-gray-500 dark:text-gray-300 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 text-xs font-bold flex items-center gap-1 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-icons-round text-sm">edit</span> Edit Info
          </button>
          
          <h1 className="text-2xl font-bold font-display text-gray-800 dark:text-white flex items-center gap-2 mt-2">
            {profile.name}, {profile.age}
            <span className="material-icons-round text-blue-500 text-lg" title="Verified">verified</span>
          </h1>
          {profile.education && (
             <p className="text-gray-600 dark:text-gray-300 text-sm font-medium flex items-center gap-1 mt-1">
                <span className="material-icons-round text-sm">school</span> {profile.education}
             </p>
          )}
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">{profile.email}</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">{profile.bio}</p>

          <div className="flex flex-wrap gap-2 justify-center items-center mb-4 px-4 relative">
            {profile.interests.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                {tag}
              </span>
            ))}
            <button 
              onClick={handleEditClick}
              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors"
              title="Edit Interests"
            >
                <span className="material-icons-round text-[14px]">edit</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center bg-white dark:bg-black/20 p-3 rounded-2xl shadow-sm min-w-[80px] border border-gray-100 dark:border-white/5">
              <span className="text-xl font-bold text-primary">২৪</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Matches</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex flex-col items-center bg-white dark:bg-black/20 p-3 rounded-2xl shadow-sm min-w-[80px] border border-gray-100 dark:border-white/5">
              <span className="text-xl font-bold text-secondary">১৫৬</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Likes</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-300 dark:bg-gray-700"></div>
             <div className="flex flex-col items-center bg-white dark:bg-black/20 p-3 rounded-2xl shadow-sm min-w-[80px] border border-gray-100 dark:border-white/5">
              <span className="text-xl font-bold text-accent">৮৫%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Complete</span>
            </div>
          </div>
        </div>

        {/* Premium Banner */}
        <Link to="/app/premium">
          <div className="mx-6 mt-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-yellow-400 dark:to-orange-500 rounded-2xl p-4 flex items-center justify-between shadow-lg transform hover:scale-[1.02] transition-transform cursor-pointer group relative overflow-hidden">
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="text-white dark:text-black z-10">
               <h3 className="font-bold font-display text-lg flex items-center gap-2">
                 <span className="material-icons-round text-yellow-400 dark:text-black">star</span>
                 তলে তলে চলে গোল্ড
               </h3>
               <p className="text-xs opacity-80 group-hover:opacity-100 transition-opacity">আনলিমিটেড লাইক ও আরও অনেক কিছু!</p>
             </div>
             <button className="bg-white dark:bg-black text-gray-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold z-10">আপগ্রেড</button>
          </div>
        </Link>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="px-6 pb-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        {/* --- Photo Gallery Section --- */}
        <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 flex items-center justify-between">
                <div>
                  My Gallery <span className="text-[10px] font-normal text-gray-400 normal-case ml-1">(Optional)</span>
                </div>
                <span className="text-xs font-normal text-gray-400">{profile.gallery.length} / 4</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map(i => {
                    const img = profile.gallery[i];
                    // Logic: Render item if it exists OR if it's the next available slot
                    const isNextSlot = i === profile.gallery.length;
                    const canInteract = img || isNextSlot;

                    if (!canInteract) return (
                        <div key={i} className="aspect-square bg-gray-100 dark:bg-surface-dark border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center opacity-40 cursor-not-allowed">
                            <span className="material-icons-round text-gray-300 dark:text-gray-600 text-2xl">photo_library</span>
                        </div>
                    );

                    return (
                        <div 
                            key={i} 
                            onClick={() => handleGalleryClick(i)}
                            className={`aspect-square relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all ${
                                !img ? 'bg-white dark:bg-surface-dark border-2 border-dashed border-primary/30 hover:bg-primary/5 flex items-center justify-center' : ''
                            }`}
                        >
                            {img ? (
                                <>
                                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] z-10">
                                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                                            <span className="material-icons-round text-white text-2xl">cached</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={(e) => removeGalleryImage(e, i)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-20 flex items-center justify-center pointer-events-auto"
                                        title="Remove photo"
                                    >
                                        <span className="material-icons-round text-[14px]">close</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-primary gap-1">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-icons-round text-2xl">add</span>
                                    </div>
                                    <span className="text-xs font-bold">Add Photo</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Responsive Grid for Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Discovery Settings */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Discovery Settings</h3>
              <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm p-5 space-y-6 border border-gray-100 dark:border-gray-700 h-full">
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-gray-700 dark:text-gray-200 font-medium">Maximum Distance</label>
                     <span className="text-primary font-bold">{distance} km</span>
                   </div>
                   <input 
                     type="range" 
                     min="1" 
                     max="100" 
                     value={distance} 
                     onChange={(e) => setDistance(parseInt(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                   />
                 </div>
                 
                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-gray-700 dark:text-gray-200 font-medium">Age Range</label>
                     <span className="text-primary font-bold">{ageRange[0]} - {ageRange[1]}</span>
                   </div>
                   
                   {/* Functional Dual Slider */}
                   <div className="relative h-6 flex items-center" ref={sliderRef}>
                      {/* Track Background */}
                      <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      
                      {/* Active Track */}
                      <div 
                        className="absolute h-2 bg-primary rounded-full"
                        style={{
                            left: `${minPos}%`,
                            right: `${100 - maxPos}%`
                        }}
                      ></div>

                      {/* Left Thumb */}
                      <div 
                        className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                        style={{ left: `calc(${minPos}% - 10px)` }}
                        onMouseDown={() => setIsDragging('min')}
                        onTouchStart={() => setIsDragging('min')}
                      ></div>

                      {/* Right Thumb */}
                      <div 
                        className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                        style={{ left: `calc(${maxPos}% - 10px)` }}
                        onMouseDown={() => setIsDragging('max')}
                        onTouchStart={() => setIsDragging('max')}
                      ></div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pt-2">
                   <span className="text-gray-700 dark:text-gray-200 font-medium">Show me on {config.appName}</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" defaultChecked className="sr-only peer" />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                 </div>

                 <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                   <div>
                       <span className="text-gray-700 dark:text-gray-200 font-medium block">Activity Status</span>
                       <span className="text-xs text-gray-400">Show when you're active</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={showActivityStatus}
                        onChange={(e) => setShowActivityStatus(e.target.checked)}
                        className="sr-only peer" 
                     />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                 </div>

                 <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                   <div>
                       <span className="text-gray-700 dark:text-gray-200 font-medium block">Show Location</span>
                       <span className="text-xs text-gray-400">Hide/Unhide distance to others</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input 
                        type="checkbox" 
                        checked={showLocation}
                        onChange={(e) => setShowLocation(e.target.checked)}
                        className="sr-only peer" 
                     />
                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                   </label>
                 </div>
              </div>
            </section>

            {/* Account & App Settings Grouped for Desktop */}
            <div className="space-y-6">
                {/* Account Security */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Account Security</h3>
                  <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                     <div 
                       onClick={() => openSecurityModal('email')}
                       className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-700"
                     >
                         <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                             <span className="material-icons-round text-xl">email</span>
                           </div>
                           <div>
                               <span className="text-gray-700 dark:text-gray-200 font-medium block">Change Email</span>
                               <span className="text-xs text-gray-400">{profile.email}</span>
                           </div>
                         </div>
                         <span className="material-icons-round text-xl text-gray-400">chevron_right</span>
                     </div>

                     <div 
                       onClick={() => openSecurityModal('password')}
                       className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                     >
                         <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                             <span className="material-icons-round text-xl">vpn_key</span>
                           </div>
                           <span className="text-gray-700 dark:text-gray-200 font-medium">Change Password</span>
                         </div>
                         <span className="material-icons-round text-xl text-gray-400">chevron_right</span>
                     </div>
                  </div>
                </section>

                {/* App Settings */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Application</h3>
                  <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                     {settingsItems.map((item, idx) => (
                       <div key={idx} onClick={item.action} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0">
                         <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${item.color}`}>
                             <span className="material-icons-round text-xl">{item.icon}</span>
                           </div>
                           <span className="text-gray-700 dark:text-gray-200 font-medium">{item.label}</span>
                         </div>
                         <div className="flex items-center text-gray-400">
                           {item.value && <span className="mr-2 text-sm">{item.value}</span>}
                           <span className="material-icons-round text-xl">chevron_right</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </section>
            </div>
        </div>

        {/* Spacer for button */}
        <div className="mt-6">
            <button 
              onClick={handleLogout}
              className="w-full py-4 text-red-500 font-bold bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              Log Out
            </button>
        </div>
        
        <div className="flex flex-col items-center justify-center pb-6 opacity-50">
           <div className="flex items-center gap-1 mb-1">
             {config.brandingIcon ? (
                <img src={config.brandingIcon} alt="Logo" className="w-4 h-4 object-contain grayscale opacity-70" />
             ) : (
                <span className="material-icons-round text-primary text-sm grayscale opacity-70">favorite</span>
             )}
             <span className="font-display font-bold text-gray-600 dark:text-gray-400">{config.appName}</span>
           </div>
           <p className="text-xs text-gray-400">Version 1.0.2 (Rajshahi Build)</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;