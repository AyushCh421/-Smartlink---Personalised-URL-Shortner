import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, SlidersHorizontal } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { Button, Card } from '../components/ui';
import UrlCard from '../components/links/UrlCard';
import CreateUrlModal from '../components/links/CreateUrlModal';
import api from '../services/api';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-totalClicks', label: 'Most clicks' },
  { value: 'totalClicks', label: 'Least clicks' }
];

export default function LinksPage() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadUrls = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page });
      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const res = await api.get(`/urls?${params}`);
      setUrls(res.data.urls);
      setPagination(res.data.pagination);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

  useEffect(() => {
    const timer = setTimeout(loadUrls, 300);
    return () => clearTimeout(timer);
  }, [loadUrls]);

  const handleCreated = (newUrl) => {
    setUrls(prev => [newUrl, ...prev]);
  };

  const handleDelete = (id) => {
    setUrls(prev => prev.filter(u => u._id !== id));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My links</h1>
            {pagination && <p className="text-sm text-gray-500 mt-0.5">{pagination.total} links total</p>}
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            New link
          </Button>
        </div>

        <Card className="p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search links..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All links</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 h-24 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : urls.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No links found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {search || status ? 'Try adjusting your filters' : 'Create your first short link to get started'}
            </p>
            {!search && !status && (
              <Button size="sm" onClick={() => setShowCreate(true)}>Create link</Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {urls.map(url => (
              <UrlCard key={url._id} url={url} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page} of {pagination.pages}
            </span>
            <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      <CreateUrlModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
    </Layout>
  );
}
