import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button, Input } from '../components/ui';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function ProtectedLinkPage() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const res = await api.post('/urls/verify-password', { shortCode: code, password });
      window.location.href = res.data.originalUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Password protected</h1>
          <p className="text-sm text-gray-500 mt-1">This link requires a password to access</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Password"
              type="password"
              placeholder="Enter the password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full" loading={loading}>
              Unlock link
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
