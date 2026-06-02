import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ScrollText, Users, BarChart3, CheckCircle, XCircle, Star, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PARTNER_BUSINESSES, QUESTS } from '../data/seed';
import type { PartnerBusiness } from '../types';

type Tab = 'businesses' | 'quests' | 'users' | 'analytics';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('businesses');
  const [businesses, setBusinesses] = useState<PartnerBusiness[]>(PARTNER_BUSINESSES);
  const [pendingBusinesses, setPendingBusinesses] = useState<PartnerBusiness[]>(PARTNER_BUSINESSES.slice(0, 2));

  const [analyticsData] = useState(() => ({
    dau: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      users: Math.floor(Math.random() * 200) + 100,
    })),
    topBusinesses: PARTNER_BUSINESSES.slice(0, 5).map(b => ({
      name: b.name.split(' ')[0],
      checkins: b.total_checkins,
    })),
  }));

  const tabs = [
    { id: 'businesses' as Tab, label: 'Businesses', icon: Building2, count: businesses.length },
    { id: 'quests' as Tab, label: 'Quests', icon: ScrollText, count: QUESTS.length },
    { id: 'users' as Tab, label: 'Users', icon: Users, count: 156 },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3, count: 0 },
  ];

  const handleApproveBusiness = (id: string) => {
    setBusinesses(prev => prev.map((b: PartnerBusiness) => b.id === id ? { ...b, is_approved: true } : b));
    setPendingBusinesses(prev => prev.filter((b: PartnerBusiness) => b.id !== id));
  };

  const handleRejectBusiness = (id: string) => {
    setPendingBusinesses(prev => prev.filter((b: PartnerBusiness) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 mt-1">Manage Waygo platform</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Admin Access
            </span>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-teal-100' : 'bg-gray-100'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            {activeTab === 'businesses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {pendingBusinesses.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-amber-900 mb-4">
                      Pending Approvals ({pendingBusinesses.length})
                    </h2>
                    <div className="space-y-3">
                      {pendingBusinesses.map((business) => (
                        <div
                          key={business.id}
                          className="bg-white rounded-xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                              {business.category === 'cafe' ? '☕' : business.category === 'museum' ? '🏛️' : '🕌'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{business.name}</p>
                              <p className="text-sm text-gray-500">{business.address}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveBusiness(business.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleRejectBusiness(business.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">All Businesses</h2>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                      Add Business
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b">
                          <th className="pb-3 font-medium">Business</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium">Tier</th>
                          <th className="pb-3 font-medium">Check-ins</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((business) => (
                          <tr key={business.id} className="border-b last:border-0">
                            <td className="py-4">
                              <p className="font-medium text-gray-900">{business.name}</p>
                              <p className="text-sm text-gray-500">{business.address}</p>
                            </td>
                            <td className="py-4 capitalize text-gray-600">{business.category}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                business.subscription_tier === 'featured'
                                  ? 'bg-amber-100 text-amber-700'
                                  : business.subscription_tier === 'basic'
                                  ? 'bg-teal-100 text-teal-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {business.subscription_tier}
                              </span>
                            </td>
                            <td className="py-4 font-medium text-gray-900">{business.total_checkins}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                business.is_approved
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {business.is_approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                                  <MapPin size={16} className="text-gray-500" />
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                                  <Star size={16} className="text-gray-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Quest Packs</h2>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    Create Quest
                  </button>
                </div>
                <div className="space-y-4">
                  {QUESTS.map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-2xl">
                        {quest.category === 'coffee' ? '☕' :
                         quest.category === 'history' ? '🏛️' :
                         quest.category === 'exploration' ? '🗺️' : '🎭'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{quest.title}</p>
                        <p className="text-sm text-gray-500">{quest.waypoint_business_ids.length} waypoints</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quest.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        quest.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {quest.difficulty}
                      </span>
                      <span className="font-medium text-teal-600">{quest.xp_reward} XP</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
                <p className="text-gray-500">User management interface - 156 users total</p>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Daily Active Users', value: '247', change: '+12%' },
                    { label: 'Total Check-ins', value: '1,847', change: '+8%' },
                    { label: 'Quest Completions', value: '423', change: '+15%' },
                    { label: 'New Vouchers', value: '89', change: '+5%' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change} vs last month</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.dau}>
                          <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#00D4C8"
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Businesses</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.topBusinesses} layout="vertical">
                          <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                          <Tooltip />
                          <Bar dataKey="checkins" fill="#00D4C8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}