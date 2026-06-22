import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/ui/Layout';
import { Card, Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState(user?.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      await api.put('/auth/me', { name });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerate your API key? Your existing key will stop working immediately.')) return;
    setRegenerating(true);
    try {
      const res = await api.post('/auth/api-key/regenerate');
      setApiKey(res.data.apiKey);
      toast.success('New API key generated');
    } catch {
      toast.error('Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied');
  };

  const maskedKey = apiKey ? apiKey.slice(0, 8) + '•'.repeat(apiKey.length - 8) : '';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <Input label="Display name" value={name} onChange={e => setName(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
                value={user?.email}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account role</label>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 capitalize">
                {user?.role}
              </span>
            </div>
            <Button loading={saving} onClick={handleSaveProfile}>Save changes</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-1">API access</h2>
          <p className="text-sm text-gray-500 mb-4">
            Use your API key to create and manage links programmatically. Include it as{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">x-api-key</code> in request headers.
          </p>

          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
            <code className="text-sm font-mono flex-1 text-gray-700 truncate">
              {showKey ? apiKey : maskedKey}
            </code>
            <button onClick={() => setShowKey(v => !v)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button onClick={copyKey} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
              <Copy size={15} />
            </button>
          </div>

          <Button variant="secondary" size="sm" loading={regenerating} onClick={handleRegenerateKey}>
            <RefreshCw size={14} />
            Regenerate key
          </Button>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Example usage</h3>
            <pre className="text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap">{`curl -X POST https://api.smartlink.dev/api/urls \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"originalUrl": "https://example.com"}'`}</pre>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
