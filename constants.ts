
import { UserProfile, Message, Report, AdminStat, UserReview, SiteConfig, AdminNotification, Moderator, ChatSession, SystemLog, ModerationItem } from './types';

export const INTERESTS_LIST = [
  '☕ টং-এর চা', '📹 YouTuber', '📱 Facebooking', '📸 Insta Reels',
  '😴 ভাত ঘুম', '😏 প্যারানাই চিল', '🐸 Meme Lover', '🦗 আড্ডা',
  '🌶️ ফুচকা লাভার', '🚲 টোটো কোম্পানি', '🦉 রাত জাগা', '🛌 ল্যাধখোর',
  '🥘 বিরিয়ানি লাভার', '🌩️ বৃষ্টি বিলাস', '🤳 Selfie Expert', '🏍️ বাইক রাইড',
  '🕺 TikToker', '🎮 PUBG/FreeFire', '📖 আঁতেল', '👻 ভূতের গল্প',
  '🎞️ Netflix & Chill', '🏏 ক্রিকেট পাগল', '🛒 শপিং', '😺 বিড়াল প্রেমী',
  '🎸 গিটার', '✈️ Travel', '⚽ Sports', '🎬 Movies',
  '📚 Reading', '💻 Tech', '🎨 Art', '💃 Dancing'
];

// Mock list of usernames that are already taken in the system
export const TAKEN_USERNAMES = [
  'admin', 'root', 'support', 'help', 'info', 'toletole', 
  'sadia', 'tanvir', 'nila', 'arifur', 'mitu', 'kuddus', 'laila', 'sojol',
  'test', 'user', 'demo'
];

export const PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    name: 'সাদিয়া',
    username: 'sadia.official',
    age: 23,
    location: 'পদ্মা পাড়, রাজশাহী',
    distance: '২ কি.মি.',
    bio: 'পদ্মা পাড়ে বসে চা খেতে ভালোবাসি। বোরিং মানুষেরা দূরে থাকো! ☕🌸',
    education: 'রাজশাহী বিশ্ববিদ্যালয়',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
    isOnline: true,
    lastActive: 'Now',
    coordinates: { lat: 24.363588, lng: 88.604169 } // Near T-Groin / Padma
  },
  {
    id: 'user-2',
    name: 'তানভীর',
    username: 'tanvir_rides',
    age: 25,
    location: 'সাহেব বাজার',
    distance: '৫ কি.মি.',
    bio: 'গিটার বাজাই, গান গাইতে পারি না। বাইক রাইডিং লাইফ! 🏍️',
    education: 'রুয়েট',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60',
    isOnline: false,
    lastActive: '1h ago',
    coordinates: { lat: 24.371306, lng: 88.599148 } // Saheb Bazar / Zero Point
  },
  {
    id: 'user-3',
    name: 'নীলা',
    username: 'nila_sky',
    age: 22,
    location: 'কাজলা',
    distance: '১ কি.মি.',
    bio: 'বই পড়ি আর আকাশ দেখি। বৃষ্টির দিন খুব প্রিয়। 📚🌧️',
    education: 'রাজশাহী কলেজ',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60',
    isOnline: true,
    lastActive: '5m ago',
    coordinates: { lat: 24.368819, lng: 88.629555 } // Near RU / Kazla
  }
];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'chat-1',
    user: { 
      id: 'user-1', 
      name: 'সাদিয়া', 
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60', 
      isOnline: true,
      lastActive: 'Active now' 
    },
    lastMessage: 'কি খবর? রাজশাহী কলেজ গেট এ আসবা?',
    timestamp: '2m ago',
    unreadCount: 2
  },
  {
    id: 'chat-2',
    user: { 
      id: 'user-2', 
      name: 'তানভীর', 
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=60', 
      isOnline: false,
      lastActive: 'Active 1h ago'
    },
    lastMessage: 'গিটার ক্লাস শেষ করে কল দিচ্ছি...',
    timestamp: '1h ago',
    unreadCount: 0
  },
  {
    id: 'chat-3',
    user: { 
      id: 'user-3', 
      name: 'নীলা', 
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60', 
      isOnline: true,
      lastActive: 'Active 5m ago'
    },
    lastMessage: 'বৃষ্টি নামলে কিন্তু বের হবো না! 🌧️',
    timestamp: 'Yesterday',
    unreadCount: 1
  }
];

export const MOCK_FRIENDS_LIST: UserProfile[] = [
  PROFILES[0], // Sadia
  PROFILES[1], // Tanvir
  PROFILES[2], // Nila
  { id: 'friend-4', name: 'Rakib Hossain', username: 'rakib_h', image: 'https://i.pravatar.cc/150?u=70', location: 'Binodpur', age: 26, isOnline: true, distance: '2 km', bio: 'Freelancer' },
  { id: 'friend-5', name: 'Mitu Sarkar', username: 'mitu.sarkar', image: 'https://i.pravatar.cc/150?u=20', location: 'New Market', age: 22, isOnline: false, lastActive: '2d ago', distance: '5 km', bio: 'Artist' }
];

export const MOCK_CONNECTION_REQUESTS = [
  {
    id: 'req-1',
    user: {
      id: 'user-req-1',
      name: 'তিশা',
      username: 'tisha_art',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      location: 'উপাশহর',
      age: 21
    },
    timestamp: '2h ago'
  },
  {
    id: 'req-2',
    user: {
      id: 'user-req-2',
      name: 'রাহিম',
      username: 'rahim_boss',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      location: 'ভদ্রা',
      age: 26
    },
    timestamp: '1d ago'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    text: 'কি খবর? রাজশাহী কলেজ গেট এ আসবা? ফুচকা খাবো! 😋',
    sender: 'them',
    timestamp: 'দুপুর ২:৩১',
    status: 'seen'
  },
  {
    id: 'msg-2',
    text: 'অবশ্যই! কিন্তু বিল টা কিন্তু তুমি দিবা আজকে 😂',
    sender: 'me',
    timestamp: 'দুপুর ২:৩২',
    status: 'seen',
    isSeen: true
  },
  {
    id: 'msg-3',
    sticker: '😮',
    sender: 'them',
    timestamp: 'দুপুর ২:৩৩',
    status: 'seen'
  },
  {
    id: 'msg-4',
    text: 'মজা করলাম! আচ্ছা ৫ মিনিটে আসছি। বাইক স্টার্ট দিলাম। 🏍️💨',
    sender: 'me',
    timestamp: 'দুপুর ২:৩৪',
    isSeen: true,
    status: 'seen'
  }
];

export const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Padma Garden Meetup',
    date: '2023-11-15',
    time: '4:00 PM',
    location: 'T-Groin, Rajshahi',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60',
    description: 'Join us for a casual meetup at the beautiful Padma Garden. Tea, snacks, and "adda" await! This is a great opportunity to meet new people in a relaxed outdoor setting.',
    attendees: 45,
    category: 'Meetup',
    status: 'Upcoming',
    price: 'Free'
  },
  {
    id: '2',
    title: 'Winter BBQ Night',
    date: '2023-12-10',
    time: '7:00 PM',
    location: 'Nanking Darbar Hall',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60',
    description: 'Warm up your winter with delicious BBQ and music. Exclusive for premium members. Limited seats available.',
    attendees: 12,
    category: 'Party',
    status: 'Upcoming',
    price: '৳500'
  },
  {
    id: '3',
    title: 'Pohela Falgun Celebration',
    date: '2024-02-13',
    time: '10:00 AM',
    location: 'Rajshahi University Campus',
    image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&auto=format&fit=crop&q=60',
    description: 'Celebrate the arrival of spring with colors and music. Wear yellow and join the festivity!',
    attendees: 150,
    category: 'Festival',
    status: 'Upcoming',
    price: 'Free'
  },
  {
    id: '4',
    title: 'Music Jam Session',
    date: '2023-10-20',
    time: '5:00 PM',
    location: 'Cafe Koral',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=60',
    description: 'Local artists performing live unplugged music. Coffee on the house!',
    attendees: 30,
    category: 'Music',
    status: 'Past',
    price: 'Free'
  }
];

export const ADMIN_STATS: AdminStat[] = [
  { label: 'Total Active Users', value: '12,453', trend: '12%', trendDirection: 'up', icon: 'group', color: 'green' },
  { label: 'Daily Matches', value: '842', trend: '5%', trendDirection: 'up', icon: 'favorite', color: 'pink' },
  { label: 'Premium Revenue', value: '৳ 85k', trend: '2%', trendDirection: 'down', icon: 'payments', color: 'yellow' },
  { label: 'Pending Reports', value: '24', trend: 'Action Req', trendDirection: 'up', icon: 'gavel', color: 'purple' },
];

export const REPORT_QUEUE: Report[] = [
  { id: '#U-8832', user: 'Rahim Sheikh', userImage: 'https://i.pravatar.cc/150?u=1', reason: 'Harassment', status: 'Pending', date: 'Oct 24, 2023', severity: 'high' },
  { id: '#U-9921', user: 'Nusrat Jahan', userImage: 'https://i.pravatar.cc/150?u=2', reason: 'Fake Profile', status: 'Pending', date: 'Oct 23, 2023', severity: 'medium' },
  { id: '#U-1102', user: 'Karim Box', userImage: 'https://i.pravatar.cc/150?u=3', reason: 'Spam', status: 'Reviewing', date: 'Oct 22, 2023', severity: 'low' },
];

export const MOCK_MODERATION_QUEUE: ModerationItem[] = [
  { id: '1', user: 'Sakib Khan', userId: 'user_101', type: 'Profile Photo', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', time: '10 mins ago' },
  { id: '2', user: 'Purnima', userId: 'user_102', type: 'Gallery Upload', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', time: '15 mins ago' },
  { id: '3', user: 'Hero Alom', userId: 'user_103', type: 'Profile Photo', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400', time: '20 mins ago' },
  { id: '4', user: 'Bubly', userId: 'user_104', type: 'Gallery Upload', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', time: '1 hour ago' },
];

export const USER_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    name: 'সুমাইয়া আক্তার',
    role: 'শিক্ষার্থী, রাজশাহী বিশ্ববিদ্যালয়',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    review: 'পদ্মা পাড়ে এখন আর একা ঘুরতে হয় না। তলে তলে এর মাধ্যমে আমার সোলমেট কে খুঁজে পেয়েছি! অ্যাপটি একদম নিরাপদ।',
    rating: 5
  },
  {
    id: 'rev-2',
    name: 'রাকিব হাসান',
    role: 'ফ্রিল্যান্সার, উপশহর',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    review: 'রাজশাহীর জন্য এমন একটা অ্যাপ খুব দরকার ছিল। ফেইক প্রোফাইল নেই বললেই চলে, ভেরিফিকেশন সিস্টেমটা দারুণ।',
    rating: 5
  },
  {
    id: 'rev-3',
    name: 'আনিকা তাবাসসুম',
    role: 'ব্যাংকার, আলুপট্টি',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200',
    review: 'অফিসের পর একটু আড্ডা দেওয়ার মতো মানুষ পাচ্ছিলাম না। এখন প্রায়ই টি-বাঁধে নতুন বন্ধুদের সাথে আড্ডা দেই।',
    rating: 4
  }
];

export const ADMIN_USERS: UserProfile[] = [
  { id: 'admin-1', name: 'Arifur Rahman', username: 'arifur_r', email: 'arif@gmail.com', phoneNumber: '01711223344', location: 'Talaimari', age: 25, status: 'active', isPremium: true, isVerified: true, joinedDate: '12 Jan 2023', image: 'https://i.pravatar.cc/150?u=10', bio: 'Software Eng.', distance: '3 km', premiumExpiryDate: '12 Jan 2025', interests: ['Coding', 'Music', 'Travel'] },
  { id: 'admin-2', name: 'Mitu Sarkar', username: 'mitu.sarkar', email: 'mitu.s@yahoo.com', phoneNumber: '01911556677', location: 'New Market', age: 22, status: 'active', isPremium: false, isVerified: true, joinedDate: '15 Feb 2023', image: 'https://i.pravatar.cc/150?u=20', bio: 'Artist', distance: '5 km', interests: ['Fashion', 'Art'] },
  { id: 'admin-3', name: 'Kuddus Boyati', username: 'kuddus99', email: 'k.boyati@outlook.com', phoneNumber: '01811889900', location: 'Station Road', age: 34, status: 'banned', isPremium: false, isVerified: false, joinedDate: '01 Mar 2023', image: 'https://i.pravatar.cc/150?u=30', bio: 'Singer', distance: '1 km', interests: ['Music', 'Folk'] },
  { id: 'admin-4', name: 'Laila Yeasmin', username: 'laila_pop', email: 'laila.pop@gmail.com', phoneNumber: '01611334455', location: 'Bhatpara', age: 27, status: 'active', isPremium: true, isVerified: false, joinedDate: '10 Mar 2023', image: 'https://i.pravatar.cc/150?u=40', bio: 'Chef', distance: '2 km', premiumExpiryDate: '20 Oct 2024', interests: ['Cooking', 'Travel'] },
  { id: 'admin-5', name: 'Sojol Ahmed', username: 'sojol_dev', email: 'sojol.code@gmail.com', phoneNumber: '01511667788', location: 'Kazla', age: 24, status: 'pending', isPremium: false, isVerified: false, joinedDate: '22 Mar 2023', image: 'https://i.pravatar.cc/150?u=50', bio: 'Gamer', distance: '4 km', interests: ['Gaming', 'Tech'] },
  { id: 'admin-6', name: 'Nusrat Faria', username: 'nusrat_f', email: 'nusrat@gmail.com', location: 'Uposhahar', age: 23, status: 'active', isPremium: false, isVerified: true, joinedDate: '25 Mar 2023', image: 'https://i.pravatar.cc/150?u=60', bio: 'Student', distance: '6 km', interests: ['Reading', 'Movies'] },
  { id: 'admin-7', name: 'Rakib Hossain', username: 'rakib_h', email: 'rakib@gmail.com', location: 'Binodpur', age: 26, status: 'active', isPremium: true, isVerified: true, joinedDate: '28 Mar 2023', image: 'https://i.pravatar.cc/150?u=70', bio: 'Freelancer', distance: '2 km', interests: ['Coding', 'Cricket'] },
];

export const MOCK_MODERATORS: Moderator[] = [
  { 
    id: 'mod-1', 
    name: 'Admin User', 
    email: 'admin@toletole.com', 
    role: 'Senior Moderator', 
    status: 'Active', 
    image: 'https://i.pravatar.cc/150?u=admin', 
    permissions: ['ban_users', 'review_reports', 'manage_content', 'view_analytics'],
    lastActive: 'Just now'
  },
  { 
    id: 'mod-2', 
    name: 'Karim Benzema', 
    email: 'karim.mod@toletole.com', 
    role: 'Moderator', 
    status: 'Active', 
    image: 'https://i.pravatar.cc/150?u=mod1', 
    permissions: ['review_reports', 'manage_content'],
    lastActive: '2 hours ago'
  },
  { 
    id: 'mod-3', 
    name: 'Salma Hayek', 
    email: 'salma.support@toletole.com', 
    role: 'Support', 
    status: 'Inactive', 
    image: 'https://i.pravatar.cc/150?u=mod2', 
    permissions: ['manage_content'],
    lastActive: '2 days ago'
  }
];

export const MOCK_SYSTEM_LOGS: SystemLog[] = [
  { id: 'LOG-1023', action: 'Banned User', admin: 'Karim Benzema', target: 'User #8832', timestamp: '2023-10-25 14:30', ip: '192.168.1.1', status: 'Success' },
  { id: 'LOG-1022', action: 'Updated Site Config', admin: 'Admin User', target: 'Hero Section', timestamp: '2023-10-25 12:15', ip: '192.168.1.5', status: 'Success' },
  { id: 'LOG-1021', action: 'Failed Login Attempt', admin: 'Unknown', target: 'Admin Portal', timestamp: '2023-10-25 10:00', ip: '45.33.22.11', status: 'Warning' },
  { id: 'LOG-1020', action: 'Created Moderator', admin: 'Admin User', target: 'Salma Hayek', timestamp: '2023-10-24 09:45', ip: '192.168.1.5', status: 'Success' },
  { id: 'LOG-1019', action: 'Bulk Email Export', admin: 'Admin User', target: 'All Users', timestamp: '2023-10-23 16:20', ip: '192.168.1.5', status: 'Success' },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  appName: 'তলে তলে চলে',
  heroTitle: '<span class="text-primary">চুপিচুপি</span> প্রেম, <br/> মন ভরা <span class="text-secondary">আনন্দ</span>',
  heroSubtitle: 'রাজশাহীর বাতাসে প্রেমের ঘ্রাণ! পদ্মা পাড়ের আড্ডার জন্য পারফেক্ট সঙ্গী খুঁজুন একদম গোপনে।',
  heroImage: 'https://images.unsplash.com/photo-1542316900-e1709c00b026?w=800&auto=format&fit=crop&q=60',
  featureTitle: "কেন 'তলে তলে চলে'?",
  reviewsTitle: 'রাজশাহীবাসীরা কি বলছে?',
  showUserCount: true,
  userCountText: '১,৫০০+ রাজশাহী ইউজার',
  reviews: USER_REVIEWS,
  primaryColor: '#E63946',
  secondaryColor: '#F4A261',
  termsAndConditions: `<h3>Terms and Conditions</h3><p>Welcome to <b>Tole Tole Chole</b>. By using this service, you agree to the following terms:</p><ul><li>You must be at least 18 years old to use this service.</li><li>Respect other users. Harassment, hate speech, or inappropriate content is strictly prohibited.</li><li>We are not responsible for offline interactions. Please stay safe when meeting in person.</li><li>Profile information must be accurate. Fake profiles will be banned.</li></ul><p><i>We reserve the right to modify these terms at any time.</i></p>`,
  premiumPlans: [
    { id: '1m', duration: '১ মাস', price: '৪৯৯', save: '' },
    { id: '6m', duration: '৬ মাস', price: '১৯৯৯', save: '৩৩% ছাড়', popular: true },
    { id: '12m', duration: '১২ মাস', price: '২৯৯৯', save: '৫০% ছাড়' },
  ],
  premiumFeatures: [
    { id: '1', icon: 'favorite', title: 'আনলিমিটেড লাইক', desc: 'যত খুশি সোয়াইপ করুন, কোনো বাধা নেই।' },
    { id: '2', icon: 'visibility', title: 'কে লাইক দিয়েছে', desc: 'ম্যাচ হওয়ার আগেই দেখুন কে আপনাকে পছন্দ করেছে।' },
    { id: '3', icon: 'flight', title: 'পাসপোর্ট', desc: 'রাজশাহীর বাইরেও অন্য শহরে ম্যাচ খুঁজুন।' },
    { id: '4', icon: 'replay', title: 'আনলিমিটেড রিওয়াইন্ড', desc: 'ভুল করে সোয়াইপ করেছেন? ফিরে যান পেছনে।' },
    { id: '5', icon: 'star', title: '৫টি সুপার লাইক', desc: 'প্রতি সপ্তাহে ৫টি ফ্রি সুপার লাইক।' },
  ],
  premiumPermissions: {
    allowUnlimitedSwipes: true,
    allowSeeLikes: true,
    allowPassport: true,
    allowRewind: true,
    allowAdvancedFilters: true,
    removeAds: true,
    allowPriorityLikes: true,
    allowMessageBeforeMatch: false,
    allowReadReceipts: true,
    allowIncognitoMode: false,
    superLikesPerMonth: 5,
    boostsPerMonth: 1,
    dailyTopPicksCount: 10
  },
  paymentGatewayUrl: 'https://www.bkash.com/',
  footerText: '© 2024 Tole Tole Chole. রাজশাহী, বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com'
  },
  developerPageUrl: '#',
  favicon: '',
  brandingIcon: '',
  interests: INTERESTS_LIST,
  aboutPage: {
    title: 'আমাদের সম্পর্কে',
    subtitle: 'রাজশাহীর প্রাণের স্পন্দন, ভালোবাসার নতুন ঠিকানা।',
    storyTitle: 'গল্পটা শুরু যেখানে',
    storyContent: 'পদ্মা পাড়ের আড্ডা, টি-বাঁধের বাতাস, আর রাজশাহী বিশ্ববিদ্যালয়ের সবুজ চত্বর - সব মিলিয়ে রাজশাহী এক ভালোবাসার শহর। কিন্তু ডিজিটাল যুগে সেই ভালোবাসাকে খুঁজে পাওয়ার জন্য কোনো বিশ্বস্ত এবং লোকাল মাধ্যম ছিল না। সেই অভাব থেকেই \'তলে তলে চলে\' এর জন্ম। আমরা চেয়েছি এমন একটি প্ল্যাটফর্ম তৈরি করতে যা হবে একান্তই আমাদের, রাজশাহীর মানুষের জন্য।',
    missionTitle: 'আমাদের লক্ষ্য',
    missionContent: 'আমাদের মূল লক্ষ্য হলো একটি নিরাপদ, পরিচ্ছন্ন এবং বিশ্বস্ত কমিউনিটি গড়ে তোলা। আমরা বিশ্বাস করি, প্রযুক্তি মানুষকে কাছে টানার জন্য, দূরে ঠেলে দেওয়ার জন্য নয়। তাই আমরা ভেরিফাইড প্রোফাইল এবং কঠোর প্রাইভেসি পলিসির মাধ্যমে নিশ্চিত করি যেন আপনার ডেটিং অভিজ্ঞতা হয় সুখকর এবং নিরাপদ।',
    whyUsTitle: 'কেন আমরা আলাদা?',
    whyUsPoints: [
      'শুধুমাত্র রাজশাহীর ভেরিফাইড ইউজার',
      'সম্পূর্ণ বাংলা ইন্টারফেস',
      'উন্নত নিরাপত্তা ব্যবস্থা ও মডারেশন',
      'প্রিমিয়াম ফিচার ও আনলিমিটেড লাইক',
      'লোকাল ইভেন্ট ও মিটআপ (শীঘ্রই আসছে)',
      'সার্বক্ষণিক সাপোর্ট টিম'
    ],
    contactTitle: 'যোগাযোগ করুন',
    contactSubtitle: 'কোনো প্রশ্ন বা পরামর্শ আছে? আমাদের জানান। আমরা আপনার অপেক্ষায় আছি।',
    contactEmail: 'contact@toletolechole.com'
  }
};

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  { id: 'notif-1', type: 'user', title: 'New Registration', message: 'Sojol Ahmed joined from Kazla.', time: '2 mins ago', isRead: false, image: 'https://i.pravatar.cc/150?u=50' },
  { id: 'notif-2', type: 'premium', title: 'New Gold Member', message: 'Arifur Rahman upgraded to Premium!', time: '1 hour ago', isRead: false, image: 'https://i.pravatar.cc/150?u=10' },
  { id: 'notif-3', type: 'report', title: 'New Report Filed', message: 'User #U-8832 reported for Harassment.', time: '3 hours ago', isRead: false },
  { id: 'notif-4', type: 'system', title: 'System Update', message: 'Server maintenance scheduled for 12:00 AM.', time: '5 hours ago', isRead: true },
];
