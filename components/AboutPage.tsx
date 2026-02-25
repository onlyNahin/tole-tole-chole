
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../SiteConfigContext';

const AboutPage: React.FC = () => {
  const { config, isDark, toggleTheme } = useSiteConfig();
  const { aboutPage } = config;

  // Fallback if aboutPage config is missing (e.g. older state)
  if (!aboutPage) {
      return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 font-body flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="transform group-hover:scale-110 transition-transform duration-300">
               {config.brandingIcon ? (
                 <img src={config.brandingIcon} alt="Logo" className="w-8 h-8 object-contain" />
               ) : (
                 <span className="material-icons-round text-primary text-3xl">favorite</span>
               )}
             </div>
             <span className="self-center text-xl font-bold font-display text-primary">{config.appName}</span>
          </Link>
          <div className="flex items-center gap-4">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title={isDark ? "Light Mode" : "Dark Mode"}
             >
                <span className="material-icons-round text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
             </button>
             <Link to="/" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
               হোম
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 container mx-auto max-w-4xl flex-1">
        <div className="text-center mb-12 animate-float">
           <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-display">{aboutPage.title}</h1>
           <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-6"></div>
           <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
             {aboutPage.subtitle}
           </p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8 md:p-12 mb-10 border border-gray-100 dark:border-gray-700 space-y-10 relative overflow-hidden">
           {/* Decorative background element */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

           <section className="relative z-10">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 font-display">
                 <span className="material-icons-round bg-primary/10 p-2 rounded-lg">history_edu</span> {aboutPage.storyTitle}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-8 text-lg">
                 {aboutPage.storyContent}
              </p>
           </section>

           <section className="relative z-10">
              <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-2 font-display">
                 <span className="material-icons-round bg-secondary/10 p-2 rounded-lg">flag</span> {aboutPage.missionTitle}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-8 text-lg">
                 {aboutPage.missionContent}
              </p>
           </section>

           <section className="relative z-10">
              <h2 className="text-2xl font-bold text-accent mb-6 flex items-center gap-2 font-display">
                 <span className="material-icons-round bg-accent/10 p-2 rounded-lg text-accent">verified_user</span> {aboutPage.whyUsTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {aboutPage.whyUsPoints.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                       <span className="material-icons-round text-green-500">check_circle</span>
                       <span className="font-medium">{item}</span>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-3xl p-8 md:p-10 border border-primary/20 backdrop-blur-sm">
           <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 font-display">{aboutPage.contactTitle}</h3>
           <p className="text-gray-600 dark:text-gray-300 mb-8">{aboutPage.contactSubtitle}</p>
           <a href={`mailto:${aboutPage.contactEmail}`} className="inline-flex items-center gap-2 bg-white dark:bg-surface-dark px-8 py-4 rounded-xl shadow-md hover:shadow-lg text-primary font-bold transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-gray-600">
              <span className="material-icons-round">mail</span> {aboutPage.contactEmail}
           </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 py-8 text-center mt-auto">
         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
           © 2024 {config.appName} | <span className="text-primary">ভালোবাসার শহর রাজশাহী ❤️</span>
         </p>
      </footer>
    </div>
  );
};

export default AboutPage;
