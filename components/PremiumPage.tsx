
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [selectedPlan, setSelectedPlan] = useState<string>(config.premiumPlans.find(p => p.popular)?.id || config.premiumPlans[0]?.id);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // Check if URL is present and redirect
    if (config.paymentGatewayUrl) {
      setTimeout(() => {
        // Redirect to external payment gateway
        window.location.href = config.paymentGatewayUrl;
      }, 1000);
    } else {
       // Fallback mock if no URL is set (for safety)
       setTimeout(() => {
         alert("Payment gateway is not configured. Redirecting back.");
         setIsProcessing(false);
         navigate('/app/profile');
       }, 1000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-600/20 to-transparent"></div>
      
      {/* Header */}
      <div className="relative z-10 p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors">
          <span className="material-icons-round text-white">close</span>
        </button>
        <h1 className="font-display font-bold text-lg text-yellow-400 flex items-center gap-1">
          <span className="material-icons-round">star</span> গোল্ড
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Carousel / Features */}
        <div className="px-6 py-4 text-center">
           <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-6 transform rotate-3 overflow-hidden">
             {config.brandingIcon ? (
                <img src={config.brandingIcon} alt="Logo" className="w-12 h-12 object-contain filter brightness-0 invert" />
             ) : (
                <span className="material-icons-round text-5xl text-white">favorite</span>
             )}
           </div>
           <h2 className="text-2xl font-bold mb-6">প্রিমিয়াম ফিচারের দুনিয়া</h2>
           
           <div className="space-y-4 text-left">
             {config.premiumFeatures.map((f) => (
               <div key={f.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                 <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white shadow-sm">
                   <span className="material-icons-round text-lg">{f.icon}</span>
                 </div>
                 <div>
                   <h3 className="font-bold text-sm text-gray-100">{f.title}</h3>
                   <p className="text-xs text-gray-400">{f.desc}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Plans */}
        <div className="px-4 mt-8">
           <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">প্ল্যান বেছে নিন</h3>
           <div className="grid grid-cols-3 gap-3">
             {config.premiumPlans.map((plan) => (
               <div 
                 key={plan.id}
                 onClick={() => setSelectedPlan(plan.id)}
                 className={`relative flex flex-col items-center p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                   selectedPlan === plan.id 
                   ? 'border-yellow-500 bg-yellow-500/10 scale-105 shadow-lg shadow-yellow-500/20' 
                   : 'border-gray-700 bg-gray-800 opacity-80'
                 }`}
               >
                 {plan.popular && (
                   <div className="absolute -top-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                     জনপ্রিয়
                   </div>
                 )}
                 <div className="text-lg font-bold mt-2">{plan.duration}</div>
                 <div className="text-xl font-display font-bold text-yellow-400">৳{plan.price}</div>
                 {plan.save && <div className="text-[10px] text-green-400 font-bold mt-1">{plan.save}</div>}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent z-20">
         <button 
           onClick={handleSubscribe}
           disabled={isProcessing}
           className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
         >
           {isProcessing ? (
             <span className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
           ) : (
             'সাবস্ক্রাইব করুন'
           )}
         </button>
         <p className="text-[10px] text-center text-gray-500 mt-3">
           Recurring billing, cancel anytime. Terms apply.
         </p>
      </div>
    </div>
  );
};

export default PremiumPage;
