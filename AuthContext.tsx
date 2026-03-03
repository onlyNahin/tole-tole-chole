import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void; // Keeping for compatibility, but should be replaced by real auth
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: any; error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        // Map DB fields to UserProfile interface
        const mappedProfile: UserProfile = {
          id: data.id,
          name: data.full_name || 'User',
          username: data.username,
          age: data.age || 0,
          location: data.location || '',
          distance: '0 km', // Default
          bio: data.bio || '',
          image: data.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
          education: data.education,
          interests: data.interests || [],
          email: user?.email,
          firstName: data.first_name,
          lastName: data.last_name,
          secondaryPhoneNumber: data.secondary_mobile,
          gender: data.gender,
          religion: data.religion,
          socialLink: data.social_link,
          isPremium: data.is_premium,
          isVerified: data.is_verified,
        };
        setProfile(mappedProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Ensure loading is set to false after profile is fetched or if no user
    if (!user || profile) {
      setIsLoading(false);
    }
  }, [user, profile]);

  const login = () => {
    // This is a legacy mock function. 
    // In Supabase, login happens via supabase.auth.signInWithPassword or similar.
    console.warn('Legacy login called. Use Supabase Auth methods instead.');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { data: null, error: 'No user authenticated' };

    // Map UserProfile fields back to DB fields
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.education !== undefined) dbUpdates.education = updates.education;
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.religion !== undefined) dbUpdates.religion = updates.religion;
    if (updates.socialLink !== undefined) dbUpdates.social_link = updates.socialLink;
    if (updates.secondaryPhoneNumber !== undefined) dbUpdates.secondary_mobile = updates.secondaryPhoneNumber;
    if (updates.image !== undefined) dbUpdates.avatar_url = updates.image;
    if (updates.location !== undefined) dbUpdates.location = updates.location;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (!error) {
      await fetchProfile(user.id);
    }

    return { data, error };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};