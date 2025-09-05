import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Users, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";
import { Campaign } from "./CampaignsPage"; // Assuming Campaign type is exported

interface DashboardStats {
  total_campaigns: number;
  total_contacts: number;
  total_sms_sent: number;
  total_cost: number;
}


const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, campaignsResponse] = await Promise.all([
          apiService.get<DashboardStats>("/reports/dashboard"),
          apiService.get<Campaign[]>("/campaigns?limit=5"),
        ]);
        setStats(statsResponse.data);
        setRecentCampaigns(campaignsResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statItems = stats
    ? [
        {
          name: "Total Cost",
          stat: `$${stats.total_cost.toFixed(2)}`,
          icon: DollarSign,
        },
        {
          name: "Total Contacts",
          stat: stats.total_contacts.toString(),
          icon: Users,
        },
        {
          name: "Campaigns Sent",
          stat: stats.total_sms_sent.toString(),
          icon: MessageSquare,
        },
        {
          name: "Total Campaigns",
          stat: stats.total_campaigns.toString(),
          icon: MessageSquare,
        },
      ]
    : [];

  return (
    <>
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border bg-white p-4 shadow dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.name}
                  </p>
                  <item.icon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold">{item.stat}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Campaign Performance
              </h2>
              <div className="rounded-xl border bg-white p-4 shadow dark:bg-gray-800">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats ? [
                    { name: 'Campaigns', value: stats.total_campaigns },
                    { name: 'Contacts', value: stats.total_contacts },
                    { name: 'SMS Sent', value: stats.total_sms_sent },
                  ] : []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">
                Recent Campaigns
              </h2>
              <div className="rounded-xl border bg-white p-4 shadow dark:bg-gray-800">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentCampaigns.map((campaign) => (
                    <li
                      key={campaign.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          campaign.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/campaigns"
                  className="mt-4 flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  View all campaigns{" "}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
