import React from 'react';
import { useHealthStatus } from '../../hooks/useAdmin';
import { CheckCircle, AlertTriangle, Server } from 'lucide-react';

const HealthStatusCard: React.FC<{
  status: 'ok' | 'error' | undefined;
  service: string;
  details?: string;
}> = ({ status, service, details }) => {
  const isOk = status === 'ok';
  return (
    <div className={`p-4 rounded-lg flex items-center ${isOk ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
      {isOk ? <CheckCircle className="h-6 w-6 text-green-500 mr-3" /> : <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />}
      <div>
        <p className="font-semibold capitalize">{service}</p>
        <p className={`text-sm ${isOk ? 'text-green-700' : 'text-red-700'}`}>{details || status}</p>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { data: healthData, isLoading } = useHealthStatus();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 flex items-center"><Server size={20} className="mr-2"/> System Health Overview</h3>
      {isLoading ? <p>Loading health status...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthStatusCard
            status={healthData?.overall_status}
            service="Overall System"
          />
          {healthData?.checks.map(check => (
            <HealthStatusCard
              key={check.service}
              status={check.status}
              service={check.service}
              details={check.details}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
