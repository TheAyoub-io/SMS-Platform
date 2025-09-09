import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGenerateCustomReport, useExportReport } from '../../hooks/useReports';
import { GeneratedReport } from '../../services/reportApi';
import { Download } from 'lucide-react';

const METRICS = [
  { id: 'delivery_rate', name: 'Delivery Rate' },
  { id: 'total_contacts', name: 'Contact Lists' },
  { id: 'messages_sent', name: 'Messages Sent' },
];

const DIMENSIONS = [
  { id: 'campaign', name: 'By Campaign' },
  { id: 'segment', name: 'By Segment' },
  { id: 'date', name: 'By Date' },
];

const CustomReportBuilder: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  const generateReportMutation = useGenerateCustomReport();
  const exportReportMutation = useExportReport();

  const handleClearReport = () => {
    setGeneratedReport(null);
    setSelectedMetrics([]);
    setSelectedDimension('');
  };

  const handleExportReport = (format: 'csv' | 'pdf' | 'excel') => {
    if (!generatedReport) return;
    
    // For now, we'll simulate export since we don't have a real campaign ID
    // In a real app, this would use the actual campaign ID from the report
    exportReportMutation.mutate({ campaignId: 1, format });
  };

  const handleGenerateReport = async () => {
    if (selectedMetrics.length === 0 || !selectedDimension) {
      toast.error('Please select at least one metric and one dimension.');
      return;
    }
    
    const reportConfig = {
      metrics: selectedMetrics,
      dimension: selectedDimension,
    };

    try {
      const report = await generateReportMutation.mutateAsync(reportConfig);
      setGeneratedReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Custom Report Builder</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Metrics</label>
          <div className="space-y-2">
            {METRICS.map(metric => (
              <div key={metric.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={metric.id} 
                  value={metric.id} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  onChange={(e) => {
                    const newSelection = e.target.checked
                      ? [...selectedMetrics, metric.id]
                      : selectedMetrics.filter(m => m !== metric.id);
                    setSelectedMetrics(newSelection);
                  }} 
                />
                <label htmlFor={metric.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">{metric.name}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Dimension</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
          >
            <option value="">Group By...</option>
            {DIMENSIONS.map(dim => <option key={dim.id} value={dim.id}>{dim.name}</option>)}
          </select>
        </div>
        
        <div className="flex items-end">
          <div className="w-full space-y-2">
            <button
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              {generateReportMutation.isLoading ? 'Generating...' : 'Generate Report'}
            </button>
            {generatedReport && (
              <button
                onClick={handleClearReport}
                className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors"
              >
                Clear & Start New
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Results */}
      {generateReportMutation.isLoading && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Generating your report...</span>
          </div>
        </div>
      )}

      {generateReportMutation.isError && (
        <div className="mt-6 border-t pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Failed to generate report. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {generatedReport && !generateReportMutation.isLoading && (
        <div className="mt-6 border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Report Results</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Generated: {new Date(generatedReport.generated_at).toLocaleString()}
              </span>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleExportReport('csv')}
                  disabled={exportReportMutation.isLoading}
                  className="flex items-center px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  disabled={exportReportMutation.isLoading}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Data Points</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                {Object.keys(generatedReport.data as Record<string, any>).length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">Metrics Analyzed</p>
              <p className="text-xl font-bold text-green-800 dark:text-green-200">
                {generatedReport.config.metrics.length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-400">Grouped By</p>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
                {DIMENSIONS.find(d => d.id === generatedReport.config.dimension)?.name || 'Unknown'}
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {DIMENSIONS.find(d => d.id === generatedReport.config.dimension)?.name || 'Dimension'}
                  </th>
                  {generatedReport.config.metrics.map(metric => (
                    <th key={metric} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {METRICS.find(m => m.id === metric)?.name || metric}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(generatedReport.data as Record<string, Record<string, number>>).map(([key, values]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {key}
                    </td>
                    {generatedReport.config.metrics.map(metric => (
                      <td key={metric} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {metric === 'delivery_rate' 
                          ? `${((values[metric] || 0) * 100).toFixed(1)}%`
                          : (values[metric] || 0).toLocaleString()
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReportBuilder;
