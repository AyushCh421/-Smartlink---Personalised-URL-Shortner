import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}
