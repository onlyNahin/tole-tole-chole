
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8 relative z-10 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-4 animate-float overflow-hidden">
             {config.brandingIcon ? (
                <img src={config.brandingIcon} alt="Logo" className="w-10 h-10 object-contain" />
             ) : (
                <span className="material-icons-round text-3xl text-white">favorite</span>
             )}
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-800 dark:text-white mb-1">{config.appName}</h1>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        {children}

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-1">
            <span className="material-icons-round text-sm">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
