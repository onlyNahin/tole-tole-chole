
import React, { createContext, useState, useContext, useEffect } from 'react';
import { SiteConfig } from './types';
import { DEFAULT_SITE_CONFIG } from './constants';

interface AccessibilityConfig {
  highContrast: boolean;
  fontSize: number; // percentage, e.g., 100, 110, 120
  reducedMotion: boolean;
}

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  accessibility: AccessibilityConfig;
  updateAccessibility: (newConfig: Partial<AccessibilityConfig>) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  
  // Initialize dark mode from localStorage
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [accessibility, setAccessibility] = useState<AccessibilityConfig>({
    highContrast: false,
    fontSize: 100,
    reducedMotion: false
  });

  const updateConfig = (newConfig: Partial<SiteConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_SITE_CONFIG);
  }

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  }

  const updateAccessibility = (newConfig: Partial<AccessibilityConfig>) => {
    setAccessibility(prev => ({ ...prev, ...newConfig }));
  };

  // Effect to handle dark mode class on html element and persistence
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Effect to handle Reduced Motion
  useEffect(() => {
    if (accessibility.reducedMotion) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }
  }, [accessibility.reducedMotion]);

  // Effect to update favicon
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (config.favicon) {
      link.href = config.favicon;
    } else {
      // Default heart emoji favicon if none provided
      link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>';
    }
  }, [config.favicon]);

  // Effect to update CSS variables when theme colors change
  useEffect(() => {
    const hexToRgb = (hex: string) => {
        let c: any;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return [(c>>16)&255, (c>>8)&255, c&255].join(' ');
        }
        return '230 57 70'; // Fallback
    };

    const darken = (hex: string, amount: number) => {
        let c: any;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            let r = (c>>16)&255;
            let g = (c>>8)&255;
            let b = c&255;
            r = Math.max(0, r - amount);
            g = Math.max(0, g - amount);
            b = Math.max(0, b - amount);
            return [r, g, b].join(' ');
        }
        return '214 40 57'; // Fallback
    }

    const root = document.documentElement;
    root.style.setProperty('--color-primary', hexToRgb(config.primaryColor));
    root.style.setProperty('--color-primary-dark', darken(config.primaryColor, 20));
    root.style.setProperty('--color-secondary', hexToRgb(config.secondaryColor));

  }, [config.primaryColor, config.secondaryColor]);

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, resetConfig, isDark, toggleTheme, accessibility, updateAccessibility }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within an SiteConfigProvider');
  }
  return context;
};
