import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Ticket, TrendingUp, Settings, RefreshCw, QrCode } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

export function PartnerDashboard() {
  const { t } = useApp();
  const fallbackBusiness = {
    id: '1',
    name: 'Kapana Creative District',
    category: 'cultural',
    description: 'The creative heart of Plovdiv',
    address: 'Kapana, Plovdiv',
    geofence_radius_meters: 200,
    subscription_tier: 'featured' as const,
    total_checkins: 127,
    is_approved: true,
  };

  const [business] = useState(fallbackBusiness);
  const [checkinCode] = useState('KAP001');
  const [chartData] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      checkins: Math.floor(Math.random() * 20) + 5,
    }))
  );

  const stats = {
    totalCheckins: 127,
    uniqueVisitors: 89,
    questCompletions: 34,
    revenueEstimate: 1270,
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[430px] mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t.partnerDashboard}</h1>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.manageBusiness}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#E0FFF5', color: '#00A090' }}>
            {t.featuredPartner}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: t.totalCheckins, value: stats.totalCheckins, icon: BarChart3, gradient: 'linear-gradient(135deg,#E8FFF5,#C0F5E8)' },
            { label: t.uniqueVisitors, value: stats.uniqueVisitors, icon: Users, gradient: 'linear-gradient(135deg,#FFF3E0,#FFE8D0)' },
            { label: t.questCompletions, value: stats.questCompletions, icon: Ticket, gradient: 'linear-gradient(135deg,#F0E8FF,#E0D0FF)' },
            { label: t.revenueEst, value: `$${stats.revenueEstimate}`, icon: TrendingUp, gradient: 'linear-gradient(135deg,#E8F0FF,#D0E8FF)' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.gradient }}>
                <stat.icon size={20} style={{ color: '#5858A0' }} />
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t.dailyCheckins}</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="day" stroke="var(--text-soft)" fontSize={11} />
                <YAxis stroke="var(--text-soft)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="checkins" stroke="#00C4B8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t.checkinCode}</h2>
            <button className="p-2 rounded-lg" style={{ background: 'var(--bg-chip)' }}>
              <RefreshCw size={16} style={{ color: 'var(--text-soft)' }} />
            </button>
          </div>
          <div className="rounded-xl p-4 text-center mb-3" style={{ background: 'linear-gradient(135deg,#1A1A3E,#2A2A50)' }}>
            <p className="text-3xl font-mono font-bold text-white tracking-widest">{checkinCode}</p>
          </div>
          <div className="flex justify-center mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'white' }}>
              <QrCode size={60} style={{ color: '#1A1A3E' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{t.businessDetails}</h2>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg,#00C4B8,#009A90)' }}>
              <Settings size={16} />{t.editListing}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-soft)' }}>{t.business}</label>
              <input type="text" defaultValue={business.name}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-soft)' }}>{t.category}</label>
              <select defaultValue={business.category}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="cafe">{t.checkIns}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-soft)' }}>Description</label>
              <textarea defaultValue={business.description} rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'var(--bg-input)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
