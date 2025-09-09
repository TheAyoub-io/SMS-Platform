import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getDashboardStats,
  getCampaignReport,
  generateCustomReport,
  exportReport,
  ReportConfig,
  DashboardStats,
  CampaignReport,
  GeneratedReport
} from '../services/reportApi';
import toast from 'react-hot-toast';

const REPORTS_QUERY_KEY = 'reports';

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>(
    [REPORTS_QUERY_KEY, 'dashboard'],
    getDashboardStats,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

export const useCampaignReport = (campaignId: number) => {
  return useQuery<CampaignReport, Error>(
    [REPORTS_QUERY_KEY, 'campaign', campaignId],
    () => getCampaignReport(campaignId),
    {
      enabled: !!campaignId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useGenerateCustomReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation<GeneratedReport, Error, ReportConfig>(
    generateCustomReport,
    {
      onSuccess: (data) => {
        queryClient.setQueryData([REPORTS_QUERY_KEY, 'custom', data.id], data);
        toast.success('Report generated successfully!');
      },
      onError: (error: any) => {
        console.error('Report generation error:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate report';
        toast.error(`Report generation failed: ${errorMessage}`);
      },
    }
  );
};

export const useExportReport = () => {
  return useMutation<Blob, Error, { campaignId: number; format: 'csv' | 'pdf' | 'excel' }>(
    ({ campaignId, format }) => exportReport(campaignId, format),
    {
      onSuccess: (blob, variables) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `campaign_report_${variables.campaignId}.${variables.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Report exported as ${variables.format.toUpperCase()}`);
      },
      onError: (error: any) => {
        console.error('Report export error:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to export report';
        toast.error(`Export failed: ${errorMessage}`);
      },
    }
  );
};
