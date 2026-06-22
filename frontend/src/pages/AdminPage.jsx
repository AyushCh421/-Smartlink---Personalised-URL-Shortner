import { useState, useEffect } from 'react';
import { Users, Link2, MousePointerClick, TrendingUp, UserX, UserCheck } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { Card, StatCard, Button, Badge } from '../components/ui';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user and all their data?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Platform management and oversight</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['overview', 'users'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'overview' ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Users} label="Total users" value={stats?.totalUsers} color="blue" />
              <StatCard icon={Link2} label="Total links" value={stats?.totalUrls} color="green" />
              <StatCard icon={MousePointerClick} label="Total clicks" value={stats?.totalClicks} color="purple" />
              <StatCard icon={TrendingUp} label="Links this month" value={stats?.newUrlsThisMonth} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Recent users</h2>
                <div className="space-y-3">
                  {stats?.recentUsers?.map(user => (
                    <div key={user._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <span className="text-xs text-gray-400">{format(new Date(user.createdAt), 'MMM d')}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Recent links</h2>
                <div className="space-y-3">
                  {stats?.recentUrls?.map(url => (
                    <div key={url._id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{url.shortCode}</p>
                        <p className="text-xs text-gray-400 truncate">{url.owner?.email}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{url.totalClicks} clicks</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Links</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Joined</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'admin' ? 'info' : 'default'}>{user.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.urlCount}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.role !== 'admin' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleUser(user._id)}
                              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
