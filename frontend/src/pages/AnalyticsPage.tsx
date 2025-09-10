import React from 'react';
import AdvancedDashboard from '../components/analytics/AdvancedDashboard';
import CustomReportBuilder from '../components/analytics/CustomReportBuilder';
import CampaignComparison from '../components/analytics/CampaignComparison';
import ContactEngagementAnalytics from '../components/analytics/ContactEngagementAnalytics';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics & BI</h1>
        <p className="text-gray-500">An overview of campaign performance and trends.</p>
      </div>
      <AdvancedDashboard />
      <CustomReportBuilder />
      <CampaignComparison />
      <ContactEngagementAnalytics />
    </div>
  );
};

export default AnalyticsPage;
