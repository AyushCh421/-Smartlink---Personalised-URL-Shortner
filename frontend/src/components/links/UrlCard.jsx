import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Copy, BarChart2, Trash2, Edit2, Lock, Clock, ExternalLink, Check } from 'lucide-react';
import { Badge } from '../ui';
import { format } from 'date-fns';
import api from '../../services/api';

export default function UrlCard({ url, onDelete }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shortUrl = url.shortUrl || `${process.env.REACT_APP_BASE_URL}/${url.customAlias || url.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/urls/${url._id}`);
      toast.success('Link deleted');
      onDelete(url._id);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = url.expiryDate && new Date() > new Date(url.expiryDate);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-primary-600 truncate">{shortUrl}</span>
            {url.isPasswordProtected && <Lock size={13} className="text-gray-400 shrink-0" />}
            {isExpired && <Badge variant="danger">Expired</Badge>}
            {!isExpired && url.isActive && <Badge variant="success">Active</Badge>}
            {!url.isActive && <Badge variant="default">Inactive</Badge>}
          </div>

          <p className="text-xs text-gray-400 truncate">{url.originalUrl}</p>
          {url.title && <p className="text-xs text-gray-500 mt-0.5 font-medium">{url.title}</p>}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BarChart2 size={12} />
              {url.totalClicks} clicks
            </span>
            {url.expiryDate && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {isExpired ? 'Expired' : 'Expires'} {format(new Date(url.expiryDate), 'MMM d, yyyy')}
              </span>
            )}
            <span>{format(new Date(url.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleCopy} title="Copy" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
          </button>
          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" title="Open original" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ExternalLink size={15} />
          </a>
          <button onClick={() => navigate(`/links/${url._id}`)} title="Analytics" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <BarChart2 size={15} />
          </button>
          <button onClick={handleDelete} disabled={deleting} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
