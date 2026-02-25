
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState<'admin' | 'moderator'>('admin'); // Role state
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Admin/Mod Auth
    setTimeout(() => {
      setIsLoading(false);
      // Pass the selected role to the dashboard via router state
      navigate('/admin', { state: { role: role } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Admin Theme Background */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 relative z-10 border border-gray-700/50 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center shadow-inner mb-4 border border-gray-600 ring-1 ring-white/5 overflow-hidden">
             {config.brandingIcon ? (
                <img src={config.brandingIcon} alt="Logo" className="w-10 h-10 object-contain" />
             ) : (
                <span className="material-icons-round text-3xl text-primary">admin_panel_settings</span>
             )}
          </div>
          <h1 className="text-2xl font-bold font-display text-white mb-1">
            {role === 'admin' ? 'Admin Portal' : 'Moderator Panel'}
          </h1>
          <p className="text-sm text-gray-400">Secure Access Management</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-700">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                role === 'admin' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('moderator')}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                role === 'moderator' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Moderator
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-round text-gray-500 group-focus-within:text-primary transition-colors">email</span>
              <input 
                type="email" 
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder-gray-600"
                placeholder={role === 'admin' ? "admin@toletole.com" : "mod@toletole.com"}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons-round text-gray-500 group-focus-within:text-primary transition-colors">vpn_key</span>
              <input 
                type="password" 
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder-gray-600"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 text-white ${
                role === 'admin' 
                ? 'bg-primary hover:bg-primary-dark shadow-primary/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                Login as {role === 'admin' ? 'Admin' : 'Moderator'} <span className="material-icons-round text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-700 pt-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 group">
            <span className="material-icons-round text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to {config.appName}
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-600 text-xs">
        <p>&copy; 2024 {config.appName} Inc. Restricted Area.</p>
        <p>Unauthorized access is prohibited.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
