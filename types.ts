
export interface UserProfile {
  id: string;
  name: string;
  username?: string; // Added username
  age: number;
  location: string;
  distance: string;
  bio: string;
  image: string;
  education?: string;
  interests?: string[];
  isOnline?: boolean;
  lastActive?: string;
  coordinates?: { lat: number; lng: number };
  // Admin fields
  email?: string;
  phoneNumber?: string;
  status?: 'active' | 'banned' | 'pending';
  joinedDate?: string;
  isPremium?: boolean;
  isVerified?: boolean;
  premiumExpiryDate?: string;
  // Extended Profile Fields
  firstName?: string;
  lastName?: string;
  secondaryPhoneNumber?: string;
  gender?: 'Male' | 'Female' | 'Other';
  religion?: 'Islam' | 'Hindu' | 'Buddhist' | 'Christian' | 'Other';
  socialLink?: string;
}

export interface UsernameCheckResponse {
  isValid: boolean;
  isAvailable: boolean;
  error?: string;
  suggestions?: string[];
}

export interface Message {
  id: string;
  text?: string;
  sticker?: string;
  sender: 'me' | 'them';
  timestamp: string;
  isSeen?: boolean;
  status?: 'sent' | 'delivered' | 'seen';
  // E2EE Fields
  isEncrypted?: boolean;
  encryptedContent?: string; // Base64 ciphertext
  iv?: string; // Base64 Initialization Vector
}

export interface ChatSession {
  id: string;
  user: {
    id: string;
    name: string;
    image: string;
    isOnline: boolean;
    lastActive?: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface AdminStat {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: string;
  color: string;
}

export interface Report {
  id: string;
  user: string;
  userImage: string;
  reason: string;
  status: 'Pending' | 'Reviewing' | 'Resolved';
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserReview {
  id: string;
  name: string;
  role: string;
  image: string;
  review: string;
  rating: number;
}

export interface PremiumPlan {
  id: string;
  duration: string;
  price: string;
  save: string;
  popular?: boolean;
}

export interface PremiumFeature {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface PremiumPermissions {
  allowUnlimitedSwipes: boolean;
  allowSeeLikes: boolean;
  allowPassport: boolean; // Virtual location
  allowRewind: boolean;
  allowAdvancedFilters: boolean;
  removeAds: boolean;
  allowPriorityLikes: boolean;
  allowMessageBeforeMatch: boolean;
  allowReadReceipts: boolean;
  allowIncognitoMode: boolean;
  superLikesPerMonth: number;
  boostsPerMonth: number;
  dailyTopPicksCount: number;
}

export interface AboutPageConfig {
  title: string;
  subtitle: string;
  storyTitle: string;
  storyContent: string;
  missionTitle: string;
  missionContent: string;
  whyUsTitle: string;
  whyUsPoints: string[];
  contactTitle: string;
  contactSubtitle: string;
  contactEmail: string;
}

export interface SiteConfig {
  appName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  featureTitle: string;
  reviewsTitle: string;
  showUserCount: boolean;
  userCountText: string;
  reviews: UserReview[];
  primaryColor: string;
  secondaryColor: string;
  termsAndConditions: string;
  premiumPlans: PremiumPlan[];
  premiumFeatures: PremiumFeature[];
  premiumPermissions: PremiumPermissions;
  paymentGatewayUrl: string;
  // Footer Config
  footerText: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  developerPageUrl: string;
  // Branding Assets
  favicon: string;
  brandingIcon: string;
  // Dynamic Interests
  interests: string[];
  // About Page Config
  aboutPage: AboutPageConfig;
  // Platform Settings
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  globalAnnouncement: string;
  freeDailySwipes: number;
}

export interface AdminNotification {
  id: string;
  type: 'user' | 'premium' | 'report' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
}

export interface Moderator {
  id: string;
  name: string;
  email: string;
  role: 'Senior Moderator' | 'Moderator' | 'Support';
  status: 'Active' | 'Inactive';
  image: string;
  permissions: string[];
  lastActive: string;
}

export interface SystemLog {
  id: string;
  action: string;
  admin: string;
  target: string;
  timestamp: string;
  ip: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
  attendees: number;
  category: string;
  status: 'Upcoming' | 'Past' | 'Draft';
  price: string;
  isJoined?: boolean;
}

export interface ModerationItem {
  id: string;
  user: string;
  userId: string;
  type: 'Profile Photo' | 'Gallery Upload';
  image: string;
  time: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  username?: string;
  issue: string;
  suggestion?: string;
  status: 'Open' | 'Closed' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  date: string;
}
