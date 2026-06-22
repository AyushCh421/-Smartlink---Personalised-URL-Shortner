import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Card } from '../ui';

const COLORS = ['#4f6ef7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ClickTrendChart = ({ data }) => (
  <Card className="p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">Click trend</h3>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip labelFormatter={v => `Date: ${v}`} />
        <Line type="monotone" dataKey="clicks" stroke="#4f6ef7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

export const DeviceBreakdownChart = ({ data }) => (
  <Card className="p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">Device breakdown</h3>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="clicks" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </Card>
);

export const BrowserChart = ({ data }) => (
  <Card className="p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">Browser breakdown</h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
        <Tooltip />
        <Bar dataKey="clicks" fill="#4f6ef7" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export const CountryTable = ({ data }) => (
  <Card className="p-5">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">Top countries</h3>
    <div className="space-y-3">
      {data.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No data yet</p>}
      {data.map((country, i) => {
        const max = data[0]?.clicks || 1;
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{country.name}</span>
              <span className="font-medium text-gray-900">{country.clicks}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full">
              <div
                className="h-1.5 bg-primary-500 rounded-full transition-all"
                style={{ width: `${(country.clicks / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);
