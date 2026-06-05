import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ScrollText, Users, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

type Tab = 'businesses' | 'quests' | 'users' | 'analytics';

const FALLBACK_BUSINESSES = [
  { id: '1', name: 'Kapana Creative District', category: 'cultural', address: 'Kapana, Plovdiv', subscription_tier: 'featured', total_checkins: 847, is_approved: true },
  { id: '2', name: 'Ancient Theatre of Philippopolis', category: 'cultural', address: 'Old Town, Plovdiv', subscription_tier: 'basic', total_checkins: 523, is_approved: true },
  { id: '3', name: 'Nebet Tepe', category: 'cultural', address: 'Old Town, Plovdiv', subscription_tier: 'featured', total_checkins: 312, is_approved: true },
  { id: '4', name: 'Raykovo Bistro', category: 'cafe', address: 'Raykovo, Plovdiv', subscription_tier: 'basic', total_checkins: 165, is_approved: false },
  { id: '5', name: 'Plovdiv Ethnographic Museum', category: 'museum', address: 'Old Town, Plovdiv', subscription_tier: 'free', total_checkins: 98, is_approved: true },
];

const FALLBACK_QUESTS = [
  { id: 'q1', title: "Coffee Lover's Trail", category: 'coffee', waypoint_business_ids: ['b1', 'b2', 'b3'], difficulty: 'easy', xp_reward: 150 },
  { id: 'q2', title: 'History of Plovdiv', category: 'history', waypoint_business_ids: ['b4', 'b5', 'b6'], difficulty: 'medium', xp_reward: 300 },
  { id: 'q3', title: 'Hidden Gems', category: 'exploration', waypoint_business_ids: ['b7', 'b8', 'b9', 'b10'], difficulty: 'hard', xp_reward: 500 },
];

export function AdminPanel() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('businesses');
  const [businesses, setBusinesses] = useState(FALLBACK_BUSINESSES);
  const [pendingBusinesses, setPendingBusinesses] = useState(FALLBACK_BUSINESSES.slice(0, 2));

  const [analyticsData] = useState(() => ({
    dau: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      users: Math.floor(Math.random() * 200) + 100,
    })),
    topBusinesses: FALLBACK_BUSINESSES.slice(0, 5).map(b => ({
      name: b.name.split(' ')[0],
      checkins: b.total_checkins,
    })),
  }));

  const tabs = [
    { id: 'businesses' as Tab, label: t.businesses, icon: Building2, count: businesses.length },
    { id: 'quests' as Tab, label: t.questPacks, icon: ScrollText, count: FALLBACK_QUESTS.length },
    { id: 'users' as Tab, label: t.users, icon: Users, count: 156 },
    { id: 'analytics' as Tab, label: t.analytics, icon: BarChart3, count: 0 },
  ];

  const handleApproveBusiness = (id: string) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, is_approved: true } : b));
    setPendingBusinesses(prev => prev.filter(b => b.id !== id));
  };

  const handleRejectBusiness = (id: string) => {
    setPendingBusinesses(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[430px] mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t.adminPanel}</h1>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.managePlatform}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#F0E8FF', color: '#B090FF' }}>
            {t.adminAccess}
          </span>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg,#F0E8FF,#E8F0FF)' : 'var(--bg-chip)',
                color: activeTab === tab.id ? '#B090FF' : 'var(--text-soft)',
                border: activeTab === tab.id ? '1.5px solid #D0C0FF' : '1.5px solid transparent',
              }}>
              <tab.icon size={18} />
              {tab.label}
              {tab.count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: activeTab === tab.id ? '#E0D8FF' : 'var(--bg-chip)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'businesses' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {pendingBusinesses.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: '#FFF8F0', border: '1.5px solid #FFE0B0' }}>
                <h2 className="text-sm font-bold mb-3" style={{ color: '#CC7700' }}>{t.pendingApprovals} ({pendingBusinesses.length})</h2>
                <div className="space-y-2">
                  {pendingBusinesses.map(business => (
                    <div key={business.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--bg-card)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#FFF3E0' }}>
                          {business.category === 'cafe' ? '☕' : business.category === 'museum' ? '🏛️' : '🕌'}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{business.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{business.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleApproveBusiness(business.id)} className="p-2 rounded-lg" style={{ background: '#E8FFF5' }}>
                          <CheckCircle size={18} style={{ color: '#00A090' }} />
                        </button>
                        <button onClick={() => handleRejectBusiness(business.id)} className="p-2 rounded-lg" style={{ background: '#FFF0F3' }}>
                          <XCircle size={18} style={{ color: '#FF6080' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t.allBusinesses}</h2>
                <button className="px-3 py-2 rounded-xl text-white text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg,#00C4B8,#009A90)' }}>{t.addBusiness}</button>
              </div>
              <div className="space-y-2">
                {businesses.map(business => (
                  <div key={business.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--bg-chip)' }}>
                        {business.category === 'cafe' ? '☕' : business.category === 'museum' ? '🏛️' : '🕌'}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{business.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{business.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: business.is_approved ? '#E8FFF5' : '#FFF0F3', color: business.is_approved ? '#00A090' : '#FF6080' }}>
                        {business.is_approved ? t.approved : t.pending}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'quests' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t.questPacks}</h2>
              <button className="px-3 py-2 rounded-xl text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg,#00C4B8,#009A90)' }}>{t.createQuest}</button>
            </div>
            <div className="space-y-2">
              {FALLBACK_QUESTS.map(quest => (
                <div key={quest.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--bg-chip)' }}>
                    {quest.category === 'coffee' ? '☕' : quest.category === 'history' ? '🏛️' : '🗺️'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{quest.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{quest.waypoint_business_ids.length} {t.waypoints}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#00A090' }}>{quest.xp_reward} {t.xp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t.userManagement}</h2>
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>156 {t.users}</p>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Daily Active Users', value: '247', change: '+12%' },
                { label: 'Total Check-ins', value: '1,847', change: '+8%' },
                { label: 'Quest Completions', value: '423', change: '+15%' },
                { label: 'New Vouchers', value: '89', change: '+5%' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{stat.label}</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Daily Active Users</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.dau}>
                    <XAxis dataKey="day" stroke="var(--text-soft)" fontSize={11} />
                    <YAxis stroke="var(--text-soft)" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#00C4B8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
