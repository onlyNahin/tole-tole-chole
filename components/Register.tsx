
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { usernameService } from '../services/UsernameService';
import { supabase } from '../services/supabaseClient';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    password: ''
  });

  // Username Logic State
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    error: null,
    suggestions: []
  });

  const [isLoading, setIsLoading] = useState(false);

  // Debounce logic for username check
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username) {
        setUsernameStatus(prev => ({ ...prev, available: null, error: null, suggestions: [] }));
        return;
      }

      setUsernameStatus(prev => ({ ...prev, checking: true, error: null, suggestions: [] }));

      try {
        const response = await usernameService.checkAvailability(formData.username);

        setUsernameStatus({
          checking: false,
          available: response.isAvailable,
          error: response.error || null,
          suggestions: response.suggestions || []
        });
      } catch (err) {
        setUsernameStatus(prev => ({ ...prev, checking: false, error: 'Checking failed' }));
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.username.length >= 3) {
        checkUsername();
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, username: suggestion }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus.available === false || usernameStatus.checking) {
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          username: formData.username,
          mobile: formData.mobile,
        }
      }
    });

    if (signUpError) {
      setUsernameStatus(prev => ({ ...prev, checking: false, error: signUpError.message }));
      setIsLoading(false);
    } else {
      setIsLoading(false);
      // Redirect to OTP verification or success
      navigate('/verify-otp', { state: { email: formData.email } });
    }
  };

  return (
    <AuthLayout
      title="নতুন একাউন্ট খুলুন"
      subtitle="ভালোবাসার খোঁজ শুরু করুন এখান থেকেই"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পুরো নাম</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">person</span>
            <input
              type="text"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="আপনার নাম"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইউজারনেম</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">alternate_email</span>
            <input
              type="text"
              required
              className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none transition-all ${usernameStatus.error
                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                : usernameStatus.available
                  ? 'border-green-500 focus:ring-2 focus:ring-green-200'
                  : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                }`}
              placeholder="username (e.g. alex_bd)"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
              autoComplete="off"
            />
            {/* Loading / Status Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {usernameStatus.checking ? (
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              ) : usernameStatus.available ? (
                <span className="material-icons-round text-green-500 text-lg">check_circle</span>
              ) : usernameStatus.error && formData.username.length > 0 ? (
                <span className="material-icons-round text-red-500 text-lg">error</span>
              ) : null}
            </div>
          </div>

          {/* Validation Messages & Suggestions */}
          <div className="mt-1">
            {usernameStatus.error && (
              <p className="text-xs text-red-500 mb-2">{usernameStatus.error}</p>
            )}

            {/* Suggestions */}
            {usernameStatus.suggestions.length > 0 && (
              <div className="animate-fade-in">
                <p className="text-xs text-gray-500 mb-1.5">Available suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {usernameStatus.suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইমেইল</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">email</span>
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">মোবাইল নাম্বার</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">phone</span>
            <input
              type="tel"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="017..."
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পাসওয়ার্ড</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-gray-400">lock</span>
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="কমপক্ষে ৬ সংখ্যা"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || usernameStatus.available === false || usernameStatus.checking}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'একাউন্ট তৈরি করুন'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          আগেই একাউন্ট আছে?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            লগ ইন করুন
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
