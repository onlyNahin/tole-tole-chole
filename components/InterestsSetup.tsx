
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useSiteConfig } from '../SiteConfigContext';

const InterestsSetup: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter(i => i !== interest));
    } else {
      if (selected.length < 5) {
        setSelected([...selected, interest]);
      } else {
         alert("সর্বোচ্চ ৫টি বিষয় নির্বাচন করা যাবে");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API save
    setTimeout(() => {
      navigate('/user-info');
    }, 1000);
  };

  const interestList = config.interests || [];

  return (
    <AuthLayout 
      title="আপনার শখ ও ভালোলাগা" 
      subtitle="আপনার পছন্দের ৫টি বিষয় বেছে নিন"
    >
      <div className="grid grid-cols-2 gap-3 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
        {interestList.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`p-3 rounded-xl border text-sm font-bold transition-all ${
              selected.includes(interest)
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 transform scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      
      <button 
        onClick={handleSubmit}
        disabled={isLoading || selected.length === 0}
        className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 transition-all"
      >
        {isLoading ? 'সেভ হচ্ছে...' : 'কন্টিনিউ করুন'}
      </button>
      
      <button 
        onClick={() => navigate('/user-info')}
        className="w-full mt-4 text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-200"
      >
        স্কিপ করুন
      </button>
    </AuthLayout>
  );
};

export default InterestsSetup;
