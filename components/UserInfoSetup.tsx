
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AuthLayout from './AuthLayout';

const UserInfoSetup: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    area: '',
    education: '',
    secondaryMobile: '',
    gender: 'Male',
    religion: 'Islam',
    age: '',
    bio: '',
    socialLink: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Save to Supabase
    const { error } = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      location: formData.area,
      education: formData.education,
      secondaryPhoneNumber: formData.secondaryMobile,
      gender: formData.gender as any,
      religion: formData.religion as any,
      age: parseInt(formData.age),
      bio: formData.bio,
      socialLink: formData.socialLink
    });

    setIsLoading(false);
    if (error) {
      alert('আপনার তথ্য সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      console.error('Setup Error:', error);
    } else {
      navigate('/app');
    }
  };

  return (
    <AuthLayout
      title="আপনার তথ্য"
      subtitle="প্রোফাইলটি সুন্দরভাবে সাজিয়ে নিন"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">নামের প্রথম অংশ</label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              placeholder="যেমন: আবির"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">নামের শেষ অংশ</label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              placeholder="যেমন: হাসান"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">এলাকা / ঠিকানা</label>
          <input
            type="text"
            name="area"
            required
            value={formData.area}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            placeholder="যেমন: সাহেব বাজার, রাজশাহী"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">শিক্ষা প্রতিষ্ঠান (Education)</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            placeholder="যেমন: রাজশাহী কলেজ"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</label>
          <input
            type="tel"
            name="secondaryMobile"
            value={formData.secondaryMobile}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            placeholder="017..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">লিঙ্গ</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            >
              <option value="Male">পুরুষ</option>
              <option value="Female">মহিলা</option>
              <option value="Other">অন্যান্য</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">বয়স</label>
            <input
              type="number"
              name="age"
              required
              min="18"
              max="100"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
              placeholder="১৮+"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">ধর্ম</label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          >
            <option value="Islam">ইসলাম</option>
            <option value="Hindu">হিন্দু</option>
            <option value="Buddhist">বৌদ্ধ</option>
            <option value="Christian">খ্রিস্টান</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">নিজের সম্পর্কে (বায়ো)</label>
          <textarea
            name="bio"
            required
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
            placeholder="আপনার সম্পর্কে কিছু লিখুন..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">সোশ্যাল মিডিয়া লিংক (ঐচ্ছিক)</label>
          <input
            type="url"
            name="socialLink"
            value={formData.socialLink}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'সম্পন্ন করুন'
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default UserInfoSetup;
