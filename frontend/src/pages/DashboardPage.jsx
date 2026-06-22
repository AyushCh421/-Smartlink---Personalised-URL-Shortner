import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, MousePointerClick, Activity, Clock, Plus, ArrowRight } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { StatCard, Card } from '../components/ui';
import { Button } from '../components/ui';
import CreateUrlModal from '../components/links/CreateUrlModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadStats = async () => {
    try {
      const res = await api.get('/urls/stats');
      setStats(res.data.stats);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const handleCreated = () => {
    loadStats();
    setShowCreate(false);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your links.</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            New link
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Link2} label="Total links" value={stats?.totalLinks ?? 0} color="blue" />
            <StatCard icon={Activity} label="Active links" value={stats?.activeLinks ?? 0} color="green" />
            <StatCard icon={Clock} label="Expired links" value={stats?.expiredLinks ?? 0} color="orange" />
            <StatCard icon={MousePointerClick} label="Total clicks" value={stats?.totalClicks ?? 0} color="purple" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Top performing links</h2>
              <Link to="/links" className="text-xs text-primary-600 flex items-center gap-1 hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {!stats?.topLinks?.length ? (
              <div className="text-center py-10">
                <Link2 size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No links yet</p>
                <button onClick={() => setShowCreate(true)} className="text-sm text-primary-600 font-medium mt-2 hover:underline">
                  Create your first link →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topLinks.map((link, i) => (
                  <div key={link._id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {link.title || link.shortCode}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{link.originalUrl}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {link.totalClicks} <span className="text-xs font-normal text-gray-400">clicks</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Plus size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Shorten a URL</p>
                  <p className="text-xs text-gray-400">Create a new short link</p>
                </div>
              </button>

              <Link
                to="/analytics"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Activity size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">View analytics</p>
                  <p className="text-xs text-gray-400">See clicks, devices, locations</p>
                </div>
              </Link>

              <Link
                to="/settings"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Link2 size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">API access</p>
                  <p className="text-xs text-gray-400">Get your API key</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <CreateUrlModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
    </Layout>
  );
}
