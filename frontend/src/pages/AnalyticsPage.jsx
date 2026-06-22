import { useState, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import { StatCard } from '../components/ui';
import { ClickTrendChart, DeviceBreakdownChart, CountryTable } from '../components/analytics/Charts';
import { MousePointerClick, Globe, Smartphone } from 'lucide-react';
import api from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/overview?period=${period}`);
        setData(res.data.analytics);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const mobileClicks = data?.deviceBreakdown?.find(d => d.name === 'Mobile')?.clicks ?? 0;
  const topCountry = data?.topCountries?.[0]?.name ?? '—';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Performance across all your links</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={MousePointerClick} label="Total clicks" value={data?.totalClicks ?? 0} color="blue" />
          <StatCard icon={Globe} label="Top country" value={topCountry} color="green" />
          <StatCard icon={Smartphone} label="Mobile clicks" value={mobileClicks} color="purple" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <ClickTrendChart data={data?.dailyTrend || []} />
            </div>
            <DeviceBreakdownChart data={data?.deviceBreakdown || []} />
            <CountryTable data={data?.topCountries || []} />
          </div>
        )}
      </div>
    </Layout>
  );
}
