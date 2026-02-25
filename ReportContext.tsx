import React, { createContext, useContext, useState, useEffect } from 'react';
import { Report } from './types';
import { REPORT_QUEUE } from './constants';
import { supabase } from './services/supabaseClient';

interface ReportContextType {
  reports: Report[];
  isLoading: boolean;
  addReport: (user: string, userImage: string, reason: string) => Promise<void>;
  updateReportStatus: (id: string, status: 'Pending' | 'Reviewing' | 'Resolved') => Promise<void>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      // Fallback to mock data
      setReports(REPORT_QUEUE);
    } else {
      setReports(data as Report[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const addReport = async (user: string, userImage: string, reason: string) => {
    const id = `#U-${Math.floor(Math.random() * 10000)}`;
    const { error } = await supabase.from('reports').insert([{
      id,
      user,
      userImage,
      reason,
      status: 'Pending',
      severity: 'medium'
    }]);
    if (error) console.error('Error adding report:', error);
    fetchReports();
  };

  const updateReportStatus = async (id: string, status: 'Pending' | 'Reviewing' | 'Resolved') => {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id);
    if (error) console.error('Error updating report status:', error);
    fetchReports();
  };

  return (
    <ReportContext.Provider value={{ reports, isLoading, addReport, updateReportStatus }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
