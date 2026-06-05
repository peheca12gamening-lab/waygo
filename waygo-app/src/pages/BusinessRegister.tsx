import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, ChevronRight, Check, ArrowLeft, Building2, QrCode, TrendingUp, Trophy, MapPin } from 'lucide-react';
import {
  registerBusinessOwner, loginBusinessOwner,
  getBusinessSession, logoutBusinessOwner,
} from '../lib/db/businessAuth';

const TIERS = [
  { id: 'free', name: 'Free', price: '0', color: '#B090FF', features: ['Basic pin on map', '1 photo', 'Basic stats'] },
  { id: 'basic', name: 'Standard', price: '29', priceLabel: 'BGN/mo', color: '#7AC8FF', features: ['Featured badge', 'Up to 5 photos', 'Search visibility', 'Visit analytics'] },
  { id: 'featured', name: 'Premium', price: '79', priceLabel: 'BGN/mo', color: '#FF90B5', features: ['Top of search results', 'Push notifications', 'Premium challenges', 'Detailed analytics'] },
];

export function BusinessRegister() {
  const [step, setStep] = useState<'landing' | 'register' | 'login' | 'portal'>('landing');
  const [session, setSession] = useState<any>(null);
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('cafe');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedTier, setSelectedTier] = useState('basic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    getBusinessSession().then(s => {
      if (s) { setSession(s); setStep('portal'); }
    });
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    const result = await registerBusinessOwner(email, password, {
      name: businessName,
      category_slug: category,
      description,
      address,
      lat: 42.1354,
      lng: 24.7453,
      subscription_tier: selectedTier as any,
    });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSession(result.owner);
    setStep('portal');
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const result = await loginBusinessOwner(loginEmail, loginPassword);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSession(result.owner);
    setStep('portal');
  };

  const handleLogout = () => {
    logoutBusinessOwner();
    setSession(null);
    setStep('landing');
  };

  // ── Landing page ──
  if (step === 'landing') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0F0F2A,#1A1A3E,#2A1A3E)' }}>
        <div className="max-w-[430px] mx-auto p-6 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)', boxShadow: '0 8px 32px rgba(176,144,255,0.3)' }}>
              <Store size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Waygo for Business</h1>
            <p className="text-white/60 text-sm max-w-xs mx-auto">
              Get discovered by Plovdiv explorers. List your business, attract visitors, and grow.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: MapPin, label: 'Get discovered', desc: 'Appear on the map' },
              { icon: TrendingUp, label: 'Grow traffic', desc: 'Analytics & insights' },
              { icon: Trophy, label: 'Run challenges', desc: 'Engage visitors' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <item.icon size={24} className="mx-auto mb-2" style={{ color: '#B090FF' }} />
                <p className="text-white text-xs font-bold mb-0.5">{item.label}</p>
                <p className="text-white/40 text-[10px]">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('register')}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="w-full py-4 rounded-2xl text-white font-bold text-base mb-3"
            style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)', boxShadow: '0 6px 24px rgba(176,144,255,0.3)' }}>
            Register Your Business
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('login')}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="w-full py-3 rounded-2xl text-white/80 font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Already registered? Log in
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Registration wizard ──
  if (step === 'register') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0F0F2A,#1A1A3E,#2A1A3E)' }}>
        <div className="max-w-[430px] mx-auto p-6 pt-12">
          <button onClick={() => formStep === 0 ? setStep('landing') : setFormStep(f => f - 1)}
            className="flex items-center gap-1 text-white/60 text-sm mb-6">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex gap-2 mb-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex-1 h-1 rounded-full"
                style={{ background: i <= formStep ? 'linear-gradient(90deg,#B090FF,#7AC8FF)' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)' }}>
              {error}
            </div>
          )}

          {/* Step 1: Business details */}
          {formStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-black text-white mb-1">Tell us about your business</h2>
              <p className="text-white/50 text-sm mb-6">This info appears on your Waygo listing.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">Business name</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    placeholder="e.g. Kapana Coffee" />
                </div>
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <option value="cafe">Café</option>
                    <option value="bar">Bar / Pub</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="shop">Shop</option>
                    <option value="gallery">Gallery</option>
                    <option value="cultural">Cultural Site</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white resize-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    placeholder="What makes your place special?" />
                </div>
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">Address</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    placeholder="e.g. 15 Ivan Vazov St" />
                </div>
              </div>
              <button onClick={() => setFormStep(1)} disabled={!businessName.trim()}
                className="w-full mt-6 py-3.5 rounded-2xl text-white font-bold disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
                Continue <ChevronRight size={16} className="inline" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Choose plan */}
          {formStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-black text-white mb-1">Choose your plan</h2>
              <p className="text-white/50 text-sm mb-6">Upgrade anytime to unlock more features.</p>
              <div className="space-y-3 mb-6">
                {TIERS.map(tier => (
                  <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                    className="w-full p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: selectedTier === tier.id ? `${tier.color}15` : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${selectedTier === tier.id ? tier.color : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: selectedTier === tier.id ? `0 0 20px ${tier.color}33` : 'none',
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: selectedTier === tier.id ? tier.color : 'rgba(255,255,255,0.1)' }}>
                          {selectedTier === tier.id && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-white font-bold">{tier.name}</span>
                      </div>
                      <span className="text-white font-black">
                        {tier.price === '0' ? 'Free' : `${tier.price} ${tier.priceLabel}`}
                      </span>
                    </div>
                    <div className="pl-8 space-y-1">
                      {tier.features.map((f, i) => (
                        <p key={i} className="text-white/50 text-xs">✓ {f}</p>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setFormStep(2)}
                className="w-full py-3.5 rounded-2xl text-white font-bold"
                style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
                Continue <ChevronRight size={16} className="inline" />
              </button>
            </motion.div>
          )}

          {/* Step 3: Account */}
          {formStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-black text-white mb-1">Create your account</h2>
              <p className="text-white/50 text-sm mb-6">Manage your listing and view stats.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    placeholder="you@business.com" />
                </div>
                <div>
                  <label className="block text-white/70 text-xs font-semibold mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    placeholder="Min 6 characters" />
                </div>
              </div>
              <button onClick={handleRegister} disabled={loading || !email || password.length < 6}
                className="w-full mt-6 py-3.5 rounded-2xl text-white font-bold disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
                {loading ? 'Creating...' : `Create Account & ${selectedTier === 'free' ? 'Start Free' : 'Subscribe'}`}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── Login ──
  if (step === 'login') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0F0F2A,#1A1A3E,#2A1A3E)' }}>
        <div className="max-w-[430px] mx-auto p-6 pt-12">
          <button onClick={() => setStep('landing')}
            className="flex items-center gap-1 text-white/60 text-sm mb-8">
            <ArrowLeft size={16} /> Back
          </button>

          <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-6">Log in to your business dashboard.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)' }}>
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-1.5">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="you@business.com" />
            </div>
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-1.5">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                className="w-full py-3 px-4 rounded-xl text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="Enter your password" />
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading || !loginEmail || !loginPassword}
            className="w-full py-3.5 rounded-2xl text-white font-bold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </div>
    );
  }

  // ── Portal / Dashboard ──
  if (step === 'portal' && session) {
    const business = session.business || {
      id: session.business_id,
      name: businessName || 'Your Business',
      description,
      address,
      category_slug: category,
      subscription_tier: selectedTier,
      total_checkins: 0,
      avg_rating: 0,
      cover_image_url: null,
      lat: 42.1354,
      lng: 24.7453,
    };

    const tierInfo = TIERS.find(t => t.id === business.subscription_tier) || TIERS[0];

    return (
      <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg,#F5F0FF,#F0F8FF)' }}>
        <div className="max-w-[430px] mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black" style={{ color: '#1A1A3E' }}>{business.name}</h1>
              <p className="text-xs" style={{ color: '#9090C0' }}>{tierInfo.name} · {business.category_slug}</p>
            </div>
            <button onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#FFF0F3', border: '1px solid #FFD0DC', color: '#FF6080' }}>
              Logout
            </button>
          </div>

          <div className="rounded-2xl p-4 mb-4"
            style={{ background: `linear-gradient(135deg,${tierInfo.color}15,${tierInfo.color}08)`, border: `1.5px solid ${tierInfo.color}40` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: tierInfo.color, color: 'white' }}>{tierInfo.name}</span>
              <span className="text-xs" style={{ color: '#9090C0' }}>{tierInfo.price === '0' ? 'Free plan' : `${tierInfo.price} ${tierInfo.priceLabel}`}</span>
            </div>
            <p className="text-sm" style={{ color: '#5858A0' }}>
              {tierInfo.id === 'featured' ? 'Your business appears at the top of search results.' :
               tierInfo.id === 'basic' ? 'Your business has a featured badge and appears in search.' :
               'Your business appears on the map.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Check-ins', value: business.total_checkins, icon: QrCode, color: '#00C4B8' },
              { label: 'Rating', value: business.avg_rating > 0 ? business.avg_rating.toFixed(1) : '—', icon: Trophy, color: '#FFB878' },
              { label: 'Plan', value: tierInfo.name, icon: Building2, color: '#B090FF' },
              { label: 'Status', value: 'Active', icon: Check, color: '#78E8C8' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
                <stat.icon size={18} className="mb-2" style={{ color: stat.color }} />
                <p className="text-2xl font-black" style={{ color: '#1A1A3E' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#9090C0' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 bg-white mb-4" style={{ border: '1.5px solid #E8E8F8' }}>
            <h2 className="font-bold text-base mb-4" style={{ color: '#1A1A3E' }}>Listing Editor</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#9090C0' }}>Business name</label>
                <input type="text" defaultValue={business.name}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F5F5FF', border: '1.5px solid #E8E8F8', color: '#1A1A3E' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#9090C0' }}>Description</label>
                <textarea defaultValue={business.description || ''} rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: '#F5F5FF', border: '1.5px solid #E8E8F8', color: '#1A1A3E' }} />
              </div>
              <button className="w-full py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
                Save Changes
              </button>
            </div>
          </div>

          {tierInfo.id === 'featured' && (
            <div className="rounded-2xl p-4 bg-white mb-4" style={{ border: '1.5px solid #E8E8F8' }}>
              <h2 className="font-bold text-base mb-3" style={{ color: '#1A1A3E' }}>Premium Challenges</h2>
              <p className="text-xs mb-3" style={{ color: '#9090C0' }}>
                Create bonus XP challenges that appear to users who visit your business.
              </p>
              <div className="space-y-2">
                <input type="text" placeholder="Challenge title (e.g. Try our new latte)"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F5F5FF', border: '1.5px solid #E8E8F8', color: '#1A1A3E' }} />
                <div className="flex gap-2">
                  <input type="number" placeholder="XP reward" defaultValue={100}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: '#F5F5FF', border: '1.5px solid #E8E8F8', color: '#1A1A3E' }} />
                  <button className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF)' }}>
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
            <h2 className="font-bold text-base mb-3" style={{ color: '#1A1A3E' }}>Check-in Code</h2>
            <div className="rounded-xl p-4 text-center mb-2"
              style={{ background: 'linear-gradient(135deg,#1A1A3E,#2A2A50)' }}>
              <p className="text-2xl font-mono font-bold text-white tracking-widest">
                {business.id?.slice(0, 6).toUpperCase()}
              </p>
            </div>
            <p className="text-xs text-center" style={{ color: '#9090C0' }}>
              Share this code with customers to check in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
