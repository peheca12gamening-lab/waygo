import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Ticket, TrendingUp, Settings, RefreshCw, QrCode } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PARTNER_BUSINESSES } from '../data/seed';

export function PartnerDashboard() {
  const [business] = useState(PARTNER_BUSINESSES[0]);
  const [checkinCode] = useState('KAP001');
  const [chartData] = useState(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      checkins: Math.floor(Math.random() * 20) + 5,
    }));
  });

  const stats = {
    totalCheckins: 127,
    uniqueVisitors: 89,
    questCompletions: 34,
    revenueEstimate: 1270,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your business on Waygo</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              Featured Partner
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Check-ins', value: stats.totalCheckins, icon: BarChart3, color: 'teal' },
            { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: Users, color: 'amber' },
            { label: 'Quest Completions', value: stats.questCompletions, icon: Ticket, color: 'purple' },
            { label: 'Revenue Est.', value: `$${stats.revenueEstimate}`, icon: TrendingUp, color: 'green' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                  stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Check-ins (Last 30 Days)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkins"
                    stroke="#00D4C8"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Check-in Code</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-center mb-4">
              <p className="text-4xl font-mono font-bold text-white tracking-widest">{checkinCode}</p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-lg">
                <QrCode size={80} className="text-gray-900" />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Display this QR code at your location for easy check-ins
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Settings size={18} />
              Edit Listing
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                defaultValue={business.name}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                defaultValue={business.category}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="cafe">Cafe</option>
                <option value="museum">Museum</option>
                <option value="cultural">Cultural</option>
                <option value="bar">Bar</option>
                <option value="shop">Shop</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                defaultValue={business.description}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Geofence Radius</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="500"
                  defaultValue={business.geofence_radius_meters}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-900 w-20">{business.geofence_radius_meters}m</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Tier</label>
              <div className="flex gap-3">
                {['Free', 'Basic', 'Featured'].map((tier) => (
                  <button
                    key={tier}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      tier === 'Featured'
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}