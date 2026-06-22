import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function ExpiredLinkPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">This link has expired</h1>
        <p className="text-sm text-gray-500 mb-6">The link you're trying to access is no longer active. Contact the link owner for a new one.</p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors">
          Go to SmartLink
        </Link>
      </div>
    </div>
  );
}
