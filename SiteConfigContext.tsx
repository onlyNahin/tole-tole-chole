
import React, { createContext, useState, useContext, useEffect } from 'react';
import { SiteConfig } from './types';
import { DEFAULT_SITE_CONFIG } from './constants';
import { supabase } from './services/supabaseClient';

interface AccessibilityConfig {
  highContrast: boolean;
  fontSize: number; // percentage, e.g., 100, 110, 120
  reducedMotion: boolean;
}

interface SiteConfigContextType {
  config: SiteConfig;
  isLoading: boolean;
  updateConfig: (newConfig: Partial<SiteConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  isDark: boolean;
  toggleTheme: () => void;
  accessibility: AccessibilityConfig;
  updateAccessibility: (newConfig: Partial<AccessibilityConfig>) => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchConfig = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      console.error('Error fetching site config:', error);
      setConfig(DEFAULT_SITE_CONFIG);
    } else if (data) {
      setConfig({
        appName: data.app_name,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        brandingIcon: data.branding_icon,
        favicon: data.favicon,
        heroTitle: data.hero_title,
        heroSubtitle: data.hero_subtitle,
        heroImage: data.hero_image,
        featureTitle: data.feature_title,
        reviewsTitle: data.reviews_title,
        showUserCount: data.show_user_count,
        userCountText: data.user_count_text,
        reviews: data.reviews || [],
        termsAndConditions: data.terms_and_conditions,
        premiumPlans: data.premium_plans || [],
        premiumFeatures: data.premium_features || [],
        premiumPermissions: data.premium_permissions || DEFAULT_SITE_CONFIG.premiumPermissions,
        paymentGatewayUrl: data.payment_gateway_url,
        footerText: data.footer_text,
        socialLinks: data.social_links || DEFAULT_SITE_CONFIG.socialLinks,
        developerPageUrl: data.developer_page_url,
        interests: data.interests || [],
        aboutPage: data.about_page || DEFAULT_SITE_CONFIG.aboutPage,
        maintenanceMode: data.maintenance_mode,
        allowNewRegistrations: data.allow_new_registrations,
        globalAnnouncement: data.global_announcement,
        freeDailySwipes: data.free_daily_swipes
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (newConfig.appName !== undefined) updateData.app_name = newConfig.appName;
    if (newConfig.primaryColor !== undefined) updateData.primary_color = newConfig.primaryColor;
    if (newConfig.secondaryColor !== undefined) updateData.secondary_color = newConfig.secondaryColor;
    if (newConfig.brandingIcon !== undefined) updateData.branding_icon = newConfig.brandingIcon;
    if (newConfig.favicon !== undefined) updateData.favicon = newConfig.favicon;
    if (newConfig.heroTitle !== undefined) updateData.hero_title = newConfig.heroTitle;
    if (newConfig.heroSubtitle !== undefined) updateData.hero_subtitle = newConfig.heroSubtitle;
    if (newConfig.heroImage !== undefined) updateData.hero_image = newConfig.heroImage;
    if (newConfig.featureTitle !== undefined) updateData.feature_title = newConfig.featureTitle;
    if (newConfig.reviewsTitle !== undefined) updateData.reviews_title = newConfig.reviewsTitle;
    if (newConfig.showUserCount !== undefined) updateData.show_user_count = newConfig.showUserCount;
    if (newConfig.userCountText !== undefined) updateData.user_count_text = newConfig.userCountText;
    if (newConfig.reviews !== undefined) updateData.reviews = newConfig.reviews;
    if (newConfig.termsAndConditions !== undefined) updateData.terms_and_conditions = newConfig.termsAndConditions;
    if (newConfig.premiumPlans !== undefined) updateData.premium_plans = newConfig.premiumPlans;
    if (newConfig.premiumFeatures !== undefined) updateData.premium_features = newConfig.premiumFeatures;
    if (newConfig.premiumPermissions !== undefined) updateData.premium_permissions = newConfig.premiumPermissions;
    if (newConfig.paymentGatewayUrl !== undefined) updateData.payment_gateway_url = newConfig.paymentGatewayUrl;
    if (newConfig.footerText !== undefined) updateData.footer_text = newConfig.footerText;
    if (newConfig.socialLinks !== undefined) updateData.social_links = newConfig.socialLinks;
    if (newConfig.developerPageUrl !== undefined) updateData.developer_page_url = newConfig.developerPageUrl;
    if (newConfig.interests !== undefined) updateData.interests = newConfig.interests;
    if (newConfig.aboutPage !== undefined) updateData.about_page = newConfig.aboutPage;
    if (newConfig.maintenanceMode !== undefined) updateData.maintenance_mode = newConfig.maintenanceMode;
    if (newConfig.allowNewRegistrations !== undefined) updateData.allow_new_registrations = newConfig.allowNewRegistrations;
    if (newConfig.globalAnnouncement !== undefined) updateData.global_announcement = newConfig.globalAnnouncement;
    if (newConfig.freeDailySwipes !== undefined) updateData.free_daily_swipes = newConfig.freeDailySwipes;

    const { error } = await supabase
      .from('site_config')
      .update(updateData)
      .eq('id', 'default');

    if (error) {
      console.error('Error updating site config:', error);
    } else {
      setConfig(prev => ({ ...prev, ...newConfig }));
    }
  };

  const resetConfig = async () => {
    await updateConfig(DEFAULT_SITE_CONFIG);
  }

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  }

  const updateAccessibility = (newConfig: Partial<AccessibilityConfig>) => {
    setAccessibility(prev => ({ ...prev, ...newConfig }));
  };

  // ... (rest of the effects remain same)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (accessibility.reducedMotion) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }
  }, [accessibility.reducedMotion]);

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
      link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>';
    }
  }, [config.favicon]);

  useEffect(() => {
    const hexToRgb = (hex: string) => {
      let c: any;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(' ');
      }
      return '230 57 70';
    };

    const darken = (hex: string, amount: number) => {
      let c: any;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        let r = (c >> 16) & 255;
        let g = (c >> 8) & 255;
        let b = c & 255;
        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);
        return [r, g, b].join(' ');
      }
      return '214 40 57';
    }

    const root = document.documentElement;
    root.style.setProperty('--color-primary', hexToRgb(config.primaryColor));
    root.style.setProperty('--color-primary-dark', darken(config.primaryColor, 20));
    root.style.setProperty('--color-secondary', hexToRgb(config.secondaryColor));

  }, [config.primaryColor, config.secondaryColor]);

  return (
    <SiteConfigContext.Provider value={{ config, isLoading, updateConfig, resetConfig, isDark, toggleTheme, accessibility, updateAccessibility }}>
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
