import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink, MousePointerClick } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { Card, Button, Badge } from '../components/ui';
import QRCodeDisplay from '../components/links/QRCodeDisplay';
import { ClickTrendChart, DeviceBreakdownChart, BrowserChart, CountryTable } from '../components/analytics/Charts';
import api from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function LinkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [url, setUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [urlRes, analyticsRes] = await Promise.all([
          api.get(`/urls/${id}`),
          api.get(`/analytics/${id}?period=${period}`)
        ]);
        setUrl(urlRes.data.url);
        setAnalytics(analyticsRes.data.analytics);
      } catch {
        toast.error('Failed to load link');
        navigate('/links');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, period]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const isExpired = url?.expiryDate && new Date() > new Date(url.expiryDate);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/links')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to links
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 mb-1">{url?.title || url?.shortCode}</h1>
                <p className="text-sm text-gray-400 truncate">{url?.originalUrl}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isExpired ? <Badge variant="danger">Expired</Badge> : <Badge variant="success">Active</Badge>}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-primary-600 flex-1 truncate">{url?.shortUrl}</span>
              <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} className="text-gray-500" />}
              </button>
              <a href={url?.originalUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <ExternalLink size={15} className="text-gray-500" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{url?.totalClicks}</p>
                <p className="text-xs text-blue-500">Total clicks</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700">{format(new Date(url?.createdAt), 'MMM d, yyyy')}</p>
                <p className="text-xs text-gray-400">Created</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700">
                  {url?.expiryDate ? format(new Date(url.expiryDate), 'MMM d, yyyy') : 'Never'}
                </p>
                <p className="text-xs text-gray-400">Expires</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 flex flex-col items-center justify-center">
            <QRCodeDisplay qrCode={url?.qrCode} shortUrl={url?.shortUrl} />
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Analytics</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map(p => (
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

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <ClickTrendChart data={analytics.dailyClicks} />
            </div>
            <DeviceBreakdownChart data={analytics.devices} />
            <BrowserChart data={analytics.browsers} />
            <div className="lg:col-span-2">
              <CountryTable data={analytics.countries} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
