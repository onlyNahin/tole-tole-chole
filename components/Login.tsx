
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../AuthContext';
import { supabase } from '../services/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State to track which method the user wants to use ('none', 'email', 'username')
  const [loginMethod, setLoginMethod] = useState<'none' | 'email' | 'username'>('none');
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: formData.identifier, // Assuming identification by email for now
      password: formData.password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      navigate('/app');
    }
  };

  const handleMethodSelect = (method: 'email' | 'username') => {
    setLoginMethod(method);
    setFormData(prev => ({ ...prev, identifier: '' })); // Clear previous input
  };

  // --- STEP 1: METHOD SELECTION SCREEN ---
  if (loginMethod === 'none') {
    return (
      <AuthLayout
        title="লগইন পদ্ধতি"
        subtitle="নিরাপত্তার স্বার্থে আপনার লগইন পদ্ধতি নির্বাচন করুন"
      >
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => handleMethodSelect('email')}
            className="w-full flex items-center p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-2xl">email</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">ইমেইল ব্যবহার করুন</h3>
              <p className="text-xs text-gray-500">আপনার রেজিস্টার্ড ইমেইল এবং পাসওয়ার্ড</p>
            </div>
            <span className="material-icons-round ml-auto text-gray-300 group-hover:text-primary">chevron_right</span>
          </button>

          <button
            onClick={() => handleMethodSelect('username')}
            className="w-full flex items-center p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-secondary hover:bg-secondary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <span className="material-icons-round text-2xl">badge</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">ইউজারনেম ব্যবহার করুন</h3>
              <p className="text-xs text-gray-500">আপনার ইউনিক ইউজারনেম এবং পাসওয়ার্ড</p>
            </div>
            <span className="material-icons-round ml-auto text-gray-300 group-hover:text-secondary">chevron_right</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            একাউন্ট নেই?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              রেজিস্ট্রেশন করুন
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // --- STEP 2: LOGIN FORM SCREEN ---
  const isEmail = loginMethod === 'email';

  return (
    <AuthLayout
      title={isEmail ? "ইমেইল লগইন" : "ইউজারনেম লগইন"}
      subtitle="আপনার একাউন্টে প্রবেশ করুন"
    >
      <div className="mb-4">
        <button
          onClick={() => setLoginMethod('none')}
          className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <span className="material-icons-round text-sm">arrow_back</span> পদ্ধতি পরিবর্তন করুন
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-red-600 text-sm font-medium animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEmail ? 'আপনার ইমেইল' : 'আপনার ইউজারনেম'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">
              {isEmail ? 'email' : 'person'}
            </span>
            <input
              type={isEmail ? "email" : "text"}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder={isEmail ? "example@email.com" : "username"}
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">পাসওয়ার্ড</label>
            <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark">ভুলে গেছেন?</a>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">lock</span>
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              লগ ইন করুন <span className="material-icons-round text-lg">login</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          একাউন্ট নেই?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
