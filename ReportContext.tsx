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
      setReports([]);
    } else {
      setReports((data || []).map(r => ({
        id: r.id,
        user: r.user_name,
        userImage: r.user_image,
        reason: r.reason,
        status: r.status,
        date: r.date,
        severity: r.severity
      } as Report)));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const addReport = async (user: string, userImage: string, reason: string) => {
    const { error } = await supabase.from('reports').insert([{
      user_name: user,
      user_image: userImage,
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
