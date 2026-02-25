
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../AuthContext';

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const email = (location.state as any)?.email || 'demo@email.com';

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take the last character if user types in a field already having a value
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input if value is entered
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
        if (otp[index] === "" && index > 0) {
            // If empty, delete previous and move focus
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        } else {
            // Just clear current
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }
    } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
        inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
       const newOtp = [...otp];
       pastedData.forEach((val, i) => {
          if (i < 4) newOtp[i] = val;
       });
       setOtp(newOtp);
       // Focus the slot after the last pasted char
       const nextIndex = Math.min(pastedData.length, 3);
       inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = () => {
      setTimeLeft(30);
      // Simulate sending logic
      alert(`ভেরিফিকেশন কোড পুনরায় ${email} এ পাঠানো হয়েছে`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login();
      setIsLoading(false);
      navigate('/interests');
    }, 1500);
  };

  return (
    <AuthLayout 
      title="ইমেইল ভেরিফিকেশন" 
      subtitle={`আমরা একটি কোড পাঠিয়েছি ${email} এ`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-3 my-6">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-14 h-14 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-center text-2xl font-bold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-0 outline-none transition-all caret-primary selection:bg-primary/20"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              autoComplete="off"
            />
          ))}
        </div>

        <div className="text-center text-sm">
            {timeLeft > 0 ? (
                <p className="text-gray-400">
                    রিসেন্ড করুন <span className="font-bold text-gray-600 dark:text-gray-300 tabular-nums">00:{timeLeft.toString().padStart(2, '0')}</span> সেকেন্ডে
                </p>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">
                    কোড পাননি?{' '}
                    <button type="button" onClick={handleResend} className="font-bold text-secondary hover:underline">
                        আবার পাঠান
                    </button>
                </p>
            )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading || otp.join('').length < 4}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
             'ভেরিফাই করুন'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default OTPVerification;
