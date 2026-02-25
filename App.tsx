
import React from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SwipeView from './components/SwipeView';
import ChatView from './components/ChatView';
import InboxView from './components/InboxView';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Register from './components/Register';
import OTPVerification from './components/OTPVerification';
import InterestsSetup from './components/InterestsSetup';
import UserInfoSetup from './components/UserInfoSetup';
import PremiumPage from './components/PremiumPage';
import AboutPage from './components/AboutPage';
import LocationView from './components/LocationView';
import ConnectionsView from './components/ConnectionsView';
import EventsPage from './components/EventsPage'; 
import { SiteConfigProvider, useSiteConfig } from './SiteConfigContext';
import { AuthProvider } from './AuthContext';
import { ReportProvider } from './ReportContext';
import { EventProvider } from './EventContext';
import { ModerationProvider } from './ModerationContext';
import { SupportProvider } from './SupportContext'; // Added SupportProvider

// Layout for the main dating app experience
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { config, isDark, toggleTheme } = useSiteConfig();

  const isActive = (path: string) => location.pathname === path;
  
  // Mobile specific chrome hiding
  const isChatRoom = location.pathname.startsWith('/app/chat/') && location.pathname !== '/app/chat';
  const isPremiumPage = location.pathname === '/app/premium';
  const hideMobileChrome = isChatRoom || isPremiumPage;

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-black overflow-hidden transition-colors duration-300 font-sans">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 z-30 shadow-sm transition-colors duration-300">
         <div className="p-6 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary overflow-hidden shrink-0">
               {config.brandingIcon ? (
                 <img src={config.brandingIcon} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <span className="material-icons-round text-primary">favorite</span>
               )}
             </div>
             <h1 className="font-display text-2xl font-bold text-primary tracking-wide">{config.appName}</h1>
         </div>

         <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {[
              { path: '/app', icon: 'style', label: 'Discover' },
              { path: '/app/map', icon: 'explore', label: 'Nearby Map' },
              { path: '/app/connections', icon: 'group', label: 'Connections' },
              { path: '/app/chat', icon: 'chat_bubble', label: 'Matches & Chat' },
              { path: '/app/events', icon: 'event', label: 'Events' },
              { path: '/app/profile', icon: 'person', label: 'My Profile' },
              { path: '/app/premium', icon: 'star', label: 'Premium', highlight: true },
            ].map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                   isActive(item.path) || (item.path === '/app/chat' && location.pathname.startsWith('/app/chat'))
                   ? 'bg-primary/10 text-primary shadow-sm' 
                   : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                 <span className={`material-icons-round text-xl ${item.highlight ? 'text-yellow-500' : ''}`}>{item.icon}</span>
                 {item.label}
              </Link>
            ))}
         </nav>

         <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
               <span className="material-icons-round">{isDark ? 'light_mode' : 'dark_mode'}</span>
               {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
         </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative h-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300">
        
        {/* Mobile Header */}
        {!hideMobileChrome && (
          <header className="md:hidden flex justify-between items-center px-4 py-3 bg-white/80 dark:bg-black/50 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary overflow-hidden">
                 {config.brandingIcon ? (
                   <img src={config.brandingIcon} alt="Logo" className="w-full h-full object-contain" />
                 ) : (
                   <span className="material-icons-round text-primary text-sm">favorite</span>
                 )}
               </div>
               <h1 className="font-display text-xl font-bold text-primary">{config.appName}</h1>
            </div>
            <div className="flex gap-2">
               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors">
                 <span className="material-icons-round text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
               </button>
            </div>
          </header>
        )}

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative w-full">
           <div className="w-full h-full md:max-w-7xl mx-auto md:p-6 lg:p-8">
              {/* On Desktop, add a container to prevent content from stretching too wide unless it's designed to */}
              <div className="w-full h-full md:bg-white md:dark:bg-surface-dark md:rounded-3xl md:shadow-sm md:border md:border-gray-100 md:dark:border-gray-800 overflow-hidden relative transition-colors duration-300">
                  {children}
              </div>
           </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {!hideMobileChrome && (
          <nav className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 py-2 px-4 z-30 pb-safe transition-colors duration-300">
            <ul className="flex justify-between items-center text-gray-400 dark:text-gray-500">
              <Link to="/app">
                <li className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/app') ? 'text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <span className="material-icons-round text-2xl">style</span>
                </li>
              </Link>
              <Link to="/app/map">
                <li className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/app/map') ? 'text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <span className="material-icons-round text-2xl">explore</span>
                </li>
              </Link>
              <Link to="/app/events">
                <li className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/app/events') ? 'text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <span className="material-icons-round text-2xl">event</span>
                </li>
              </Link>
              <Link to="/app/connections">
                <li className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/app/connections') ? 'text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <span className="material-icons-round text-2xl">group</span>
                </li>
              </Link>
              <Link to="/app/chat">
                <li className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${location.pathname.startsWith('/app/chat') ? 'text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                   <span className="material-icons-round text-2xl">chat_bubble</span>
                </li>
              </Link>
              <Link to="/app/profile">
                <li className={`cursor-pointer flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/app/profile') ? 'text-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                   <span className="material-icons-round text-2xl">person</span>
                </li>
              </Link>
            </ul>
          </nav>
        )}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/interests" element={<InterestsSetup />} />
      <Route path="/user-info" element={<UserInfoSetup />} />

      {/* Admin Auth */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Static Pages */}
      <Route path="/about" element={<AboutPage />} />

      {/* Dating App Routes - Nested */}
      <Route path="/app/*" element={
        <AppLayout>
           <Routes>
             <Route path="" element={<SwipeView />} />
             <Route path="map" element={<LocationView />} />
             <Route path="events" element={<EventsPage />} />
             <Route path="connections" element={<ConnectionsView />} />
             <Route path="chat" element={<InboxView />} />
             <Route path="chat/:id" element={<ChatView />} />
             <Route path="profile" element={<ProfileView />} />
             <Route path="premium" element={<PremiumPage />} />
           </Routes>
        </AppLayout>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <ReportProvider>
          <EventProvider>
            <ModerationProvider>
              <SupportProvider>
                <HashRouter>
                  <AppRoutes />
                </HashRouter>
              </SupportProvider>
            </ModerationProvider>
          </EventProvider>
        </ReportProvider>
      </AuthProvider>
    </SiteConfigProvider>
  );
};

export default App;
