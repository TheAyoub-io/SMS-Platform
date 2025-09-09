import api from './api';

export interface ReportConfig {
  metrics: string[];
  dimension: string;
  campaign_id?: number;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  data: any;
  generated_at: string;
  status: 'generating' | 'completed' | 'failed';
}

export interface DashboardStats {
  total_campaigns: number;
  total_contacts: number;
  total_sms_sent: number;
  total_cost: number;
  overall_delivery_rate: number;
  total_messages_delivered: number;
  total_messages_failed: number;
}

export interface CampaignReport {
  id_rapport: number;
  id_campagne: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  taux_ouverture: number;
  taux_clics: number;
  taux_conversion: number;
  nombre_desabonnements: number;
  total_cost: number;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/reports/dashboard');
  return response.data;
};

// Get campaign report
export const getCampaignReport = async (campaignId: number): Promise<CampaignReport> => {
  const response = await api.get<CampaignReport>(`/reports/campaign/${campaignId}`);
  return response.data;
};

// Generate custom report
export const generateCustomReport = async (config: ReportConfig): Promise<GeneratedReport> => {
  // For now, we'll simulate the report generation based on available data
  const reportData = await simulateReportGeneration(config);
  return reportData;
};

// Export report in different formats
export const exportReport = async (campaignId: number, format: 'csv' | 'pdf' | 'excel'): Promise<Blob> => {
  const response = await api.get(`/reports/export/${format}/${campaignId}`, {
    responseType: 'blob'
  });
  return response.data;
};

// Simulate report generation based on available data
const simulateReportGeneration = async (config: ReportConfig): Promise<GeneratedReport> => {
  // Get dashboard stats for baseline data
  const dashboardStats = await getDashboardStats();
  
  let reportData: any = {};

  // Process metrics
  if (config.metrics.includes('delivery_rate')) {
    reportData.delivery_rate = dashboardStats.overall_delivery_rate;
  }
  
  if (config.metrics.includes('total_contacts')) {
    reportData.total_contacts = dashboardStats.total_contacts;
  }
  
  if (config.metrics.includes('messages_sent')) {
    reportData.messages_sent = dashboardStats.total_sms_sent;
  }

  // Process dimension grouping
  switch (config.dimension) {
    case 'campaign':
      reportData.grouped_by = 'campaign';
      // In a real implementation, this would fetch campaign-grouped data
      reportData.groups = [
        { name: 'Back to School Promotions', value: Math.round(reportData.delivery_rate * 0.8) },
        { name: 'INWI Campaign', value: Math.round(reportData.delivery_rate * 1.2) },
        { name: 'Orange Campaign', value: Math.round(reportData.delivery_rate * 0.9) }
      ];
      break;
    case 'segment':
      reportData.grouped_by = 'segment';
      reportData.groups = [
        { name: 'Premium Customers', value: Math.round(reportData.delivery_rate * 1.1) },
        { name: 'Regular Customers', value: Math.round(reportData.delivery_rate * 0.9) },
        { name: 'New Customers', value: Math.round(reportData.delivery_rate * 0.8) }
      ];
      break;
    case 'date':
      reportData.grouped_by = 'date';
      reportData.groups = [
        { name: 'Last 7 days', value: Math.round(reportData.delivery_rate * 1.0) },
        { name: 'Last 30 days', value: Math.round(reportData.delivery_rate * 0.95) },
        { name: 'Last 90 days', value: Math.round(reportData.delivery_rate * 0.88) }
      ];
      break;
    default:
      reportData.groups = [];
  }

  return {
    id: `report_${Date.now()}`,
    config,
    data: reportData,
    generated_at: new Date().toISOString(),
    status: 'completed'
  };
};
