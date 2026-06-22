import { Link } from 'react-router-dom';
import { Zap, BarChart2, Lock, Globe, QrCode, Clock, ArrowRight, Check } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Instant shortening', desc: 'Turn any URL into a clean, memorable link in milliseconds.' },
  { icon: BarChart2, title: 'Deep analytics', desc: 'Track clicks, devices, browsers, and geographic data in real time.' },
  { icon: Lock, title: 'Password protection', desc: 'Secure sensitive links with a password before anyone can access them.' },
  { icon: Globe, title: 'Custom aliases', desc: 'Brand your links with custom slugs like smartlink.io/your-brand.' },
  { icon: QrCode, title: 'QR code generation', desc: 'Every link automatically gets a downloadable QR code.' },
  { icon: Clock, title: 'Link expiration', desc: 'Set links to auto-expire after a date — perfect for time-limited campaigns.' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SmartLink</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="text-sm bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
          Production-ready URL management
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Links that work<br />
          <span className="text-primary-500">harder for you</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Shorten, brand, track, and protect your URLs. SmartLink gives you enterprise-grade link management with real-time analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Start for free
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything you need</h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">One platform to create, manage and analyze all your links.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-primary-200 transition-colors">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Simple pricing. No surprises.</h2>
        <div className="bg-white border-2 border-primary-500 rounded-2xl p-8 shadow-xl shadow-primary-100">
          <div className="text-sm font-semibold text-primary-600 mb-2">Free forever</div>
          <div className="text-5xl font-extrabold text-gray-900 mb-6">$0 <span className="text-base font-normal text-gray-400">/month</span></div>
          <ul className="space-y-3 text-sm text-gray-600 mb-8 text-left max-w-xs mx-auto">
            {['Unlimited short links', 'Custom aliases', 'QR code generation', 'Click analytics', 'Password protection', 'API access'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <Check size={16} className="text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/register" className="block text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Get started now
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <p>Built with React, Node.js, MongoDB, Redis. Deployed on Vercel + Render.</p>
      </footer>
    </div>
  );
}
