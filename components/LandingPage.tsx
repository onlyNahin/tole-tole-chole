
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';
import { useAuth } from '../AuthContext';
import { useSupport } from '../SupportContext';

const LandingPage: React.FC = () => {
  const { config, isDark, toggleTheme } = useSiteConfig();
  const { isAuthenticated } = useAuth();
  const { addTicket } = useSupport();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    username: '',
    issue: '',
    suggestion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate delay
    setTimeout(() => {
        addTicket({
            name: supportForm.name,
            email: supportForm.email,
            username: supportForm.username || undefined,
            issue: supportForm.issue,
            suggestion: supportForm.suggestion || undefined,
        });
        setIsSubmitting(false);
        setIsSupportOpen(false);
        setSupportForm({ name: '', email: '', username: '', issue: '', suggestion: '' });
        alert('আপনার টিকিট সফলভাবে জমা দেওয়া হয়েছে!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden transition-colors duration-300 flex flex-col relative">
      <nav className="fixed w-full z-50 top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-secondary/20">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <div className="flex items-center gap-2">
            {config.brandingIcon ? (
              <img src={config.brandingIcon} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <span className="material-icons-round text-primary text-3xl">favorite</span>
            )}
            <span className="self-center text-2xl font-bold font-display text-primary">{config.appName}</span>
          </div>
          <div className="flex items-center gap-4">
             <Link to="/about" className="hidden sm:block text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
               আমাদের সম্পর্কে
             </Link>
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? "Light Mode" : "Dark Mode"}
             >
                <span className="material-icons-round">{isDark ? 'light_mode' : 'dark_mode'}</span>
             </button>
             <Link to="/login" className="text-primary bg-surface-light hover:bg-secondary/20 font-medium rounded-full text-sm px-5 py-2.5 transition-all">লগ ইন</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            {/* Text Column */}
            <div className="w-full md:w-5/12 text-center md:text-left order-2 md:order-1">
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6 font-display text-gray-900 dark:text-white leading-tight"
                dangerouslySetInnerHTML={{ __html: config.heroTitle }}
              >
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-medium max-w-lg mx-auto md:mx-0">
                {config.heroSubtitle}
              </p>
              
              {config.showUserCount && (
                <div className="flex justify-center md:justify-start items-center gap-2 mb-10 bg-white/60 dark:bg-surface-dark/60 backdrop-blur px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm w-fit mx-auto md:mx-0">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <img key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{config.userCountText}</span>
                </div>
              )}
            </div>

            {/* Image Column */}
            <div className="w-full md:w-5/12 relative order-1 md:order-2 flex justify-center md:justify-start">
              <div className="relative w-full max-w-md animate-float">
                <div className="absolute inset-0 bg-secondary/20 rounded-full filter blur-3xl transform scale-90"></div>
                <img src={config.heroImage} alt="Couple on rickshaw" className="relative z-10 w-full rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface-light dark:bg-surface-dark rounded-t-[3rem] relative z-20 transition-colors duration-300 flex-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-3 text-gray-900 dark:text-white">{config.featureTitle}</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto font-medium">প্রেম হবে গোপনে, কিন্তু আনন্দ হবে প্রকাশ্যে! দেখুন কেন আমরাই সেরা।</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
            {[
              { 
                icon: 'volunteer_activism', 
                title: 'বোরিং লাইফে বিনোদন', 
                desc: 'জীবনটা তেজপাতা হয়ে গেছে? অ্যাপে আসুন, রোমান্স আর হাসাহাসি একদম ফ্রি!', 
                color: 'text-pink-500', 
                bg: 'bg-pink-100 dark:bg-pink-900/20' 
              },
              { 
                icon: 'visibility_off', 
                title: 'চাচা-খালা রোধী', 
                desc: 'পাড়ার মোড়ের সিসিটিভি আন্টিদের নজর এড়িয়ে প্রেম করার নিনজা টেকনিক আমাদের জানা আছে।', 
                color: 'text-purple-500', 
                bg: 'bg-purple-100 dark:bg-purple-900/20' 
              },
              { 
                icon: 'location_on', 
                title: 'খাঁটি রাজশাহী ভাইব', 
                desc: 'টি-বাঁধের বাতাস আর কালাই রুটির ঝাল - রাজশাহীর প্রেমে নেই কোনো ভেজাল!', 
                color: 'text-orange-500', 
                bg: 'bg-orange-100 dark:bg-orange-900/20' 
              },
              { 
                icon: 'verified_user', 
                title: 'ফেইক মানুষ সাবধান', 
                desc: 'এখানে কোনো "অচিনপুরের রাজকণ্যা" নেই। সবাই রক্ত-মাংসের আসল মানুষ।', 
                color: 'text-green-500', 
                bg: 'bg-green-100 dark:bg-green-900/20' 
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-background-dark p-6 rounded-2xl shadow-lg border border-transparent hover:border-primary/20 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`material-icons-round text-3xl ${feature.color}`}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white font-display">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* New User Reviews Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-display mb-3 text-gray-900 dark:text-white">{config.reviewsTitle}</h2>
              <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
              <p className="text-gray-500 mt-4">আসল মানুষের আসল ভালোবাসার গল্প</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {config.reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-background-dark p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-icons-round text-3xl">format_quote</span>
                  </div>
                  <div className="mt-4 mb-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-icons-round text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>star</span>
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic font-medium leading-relaxed">"{review.review}"</p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-secondary" />
                    <div>
                      <h4 className="font-bold font-display text-gray-800 dark:text-white">{review.name}</h4>
                      <p className="text-xs text-primary font-bold uppercase tracking-wide">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Section */}
      <section className="py-12 bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
         <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-sm md:prose-base dark:prose-invert prose-headings:font-display prose-a:text-primary">
               <div dangerouslySetInnerHTML={{__html: config.termsAndConditions}} />
            </div>
         </div>
      </section>

      {/* --- Footer Section --- */}
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 py-12 transition-colors duration-300 mb-20">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                     {config.brandingIcon ? (
                        <img src={config.brandingIcon} alt="Logo" className="w-6 h-6 object-contain" />
                     ) : (
                        <span className="material-icons-round text-primary text-2xl">favorite</span>
                     )}
                     <h3 className="font-display font-bold text-xl text-gray-800 dark:text-white">{config.appName}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-3">{config.footerText}</p>
                  <Link to="/about" className="text-sm font-bold text-primary hover:underline">আমাদের সম্পর্কে জানুন</Link>
               </div>

               <div className="flex gap-4">
                  {config.socialLinks.facebook && (
                    <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                    </a>
                  )}
                  {config.socialLinks.twitter && (
                    <a href={config.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center text-gray-800 dark:text-white hover:scale-110 transition-transform">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                    </a>
                  )}
                  {config.socialLinks.instagram && (
                    <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center text-pink-600 hover:scale-110 transition-transform">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.153 1.772c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                    </a>
                  )}
               </div>

               <div>
                 <a href={config.developerPageUrl} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group">
                    <span className="material-icons-round text-lg group-hover:rotate-12 transition-transform">code</span>
                    Developers
                 </a>
               </div>
            </div>
         </div>
      </footer>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-lg transition-colors duration-300">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <Link 
            to={isAuthenticated ? "/app" : "/register"} 
            className="bg-secondary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
             <span className="material-icons-round">search</span> ম্যাচ খুঁজুন
          </Link>
          <Link to="/register" className="bg-primary text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse">
             <span className="material-icons-round">favorite</span> শুরু করুন
          </Link>
        </div>
      </div>
      <div className="h-24"></div>

      {/* Floating Support Button */}
      <button 
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-24 right-4 z-[100] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group"
        title="Support Chat"
      >
        <span className="material-icons-round text-2xl group-hover:animate-pulse">support_agent</span>
      </button>

      {/* Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsSupportOpen(false)}>
            <div 
                className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
                    <div>
                        <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
                            <span className="material-icons-round">support_agent</span> Support Center
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">We are here to help!</p>
                    </div>
                    <button onClick={() => setIsSupportOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                            <input 
                                type="text" 
                                required
                                value={supportForm.name}
                                onChange={e => setSupportForm({...supportForm, name: e.target.value})}
                                className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                            <input 
                                type="email" 
                                required
                                value={supportForm.email}
                                onChange={e => setSupportForm({...supportForm, email: e.target.value})}
                                className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                placeholder="contact@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Username (Optional)</label>
                            <input 
                                type="text" 
                                value={supportForm.username}
                                onChange={e => setSupportForm({...supportForm, username: e.target.value})}
                                className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                placeholder="ToleToleChole Username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Issue / Subject</label>
                            <textarea 
                                required
                                rows={3}
                                value={supportForm.issue}
                                onChange={e => setSupportForm({...supportForm, issue: e.target.value})}
                                className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:text-white resize-none"
                                placeholder="Describe your issue..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Suggestion (Optional)</label>
                            <textarea 
                                rows={2}
                                value={supportForm.suggestion}
                                onChange={e => setSupportForm({...supportForm, suggestion: e.target.value})}
                                className="w-full text-sm rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:text-white resize-none"
                                placeholder="Any suggestions for us?"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span className="material-icons-round">send</span> Create Ticket
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
