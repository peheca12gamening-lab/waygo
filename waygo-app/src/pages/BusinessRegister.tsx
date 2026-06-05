import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, ChevronRight, Check, ArrowLeft, TrendingUp,
  Trophy, MapPin, Briefcase, Eye, Users, Zap, Camera, X, ToggleLeft, ToggleRight, Plus,
} from 'lucide-react';
import {
  registerBusinessOwner, loginBusinessOwner,
  getBusinessSession, logoutBusinessOwner,
} from '../lib/db/businessAuth';

const rainbowGrad = 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF,#78E8C8)';

const TIERS = [
  {
    id: 'free', name: 'Free', price: '0', color: '#78E8C8',
    features: ['Basic pin on map', 'QR check-in code', 'Total check-in count', 'Profile listing'],
    missing: ['Featured badge', 'Search placement', 'Photos', 'Analytics', 'XP challenges'],
    badge: null,
  },
  {
    id: 'basic', name: 'Standard', price: '29', priceLabel: 'BGN/mo', color: '#B090FF',
    features: ['Featured badge on map', 'Up to 5 photos', 'Search visibility', 'Monthly analytics', 'Priority placement'],
    missing: ['Push notifications', 'XP challenges', 'Top search placement'],
    badge: 'POPULAR',
  },
  {
    id: 'featured', name: 'Premium', price: '79', priceLabel: 'BGN/mo', color: '#FF90B5',
    features: ['Top of search results', 'Push notifications to nearby users', 'Full analytics dashboard', 'XP bonus challenges', 'Unlimited photos', 'Dedicated support'],
    missing: [],
    badge: 'BEST VALUE',
  },
];

const CATEGORIES = ['Café', 'Restaurant', 'Bar', 'Shop', 'Hotel', 'Gallery', 'Other'];

interface Challenge { id: string; text: string; xp: number; redeemed: number; active: boolean }

export function BusinessRegister() {
  const [step, setStep] = useState<'landing' | 'register' | 'login' | 'confirmation' | 'portal'>('landing');
  const [session, setSession] = useState<any>(null);
  const [formStep, setFormStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [selectedTier, setSelectedTier] = useState('free');

  // Portal state
  const [editDesc, setEditDesc] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: '1', text: 'Show this screen to the barista', xp: 15, redeemed: 34, active: true },
    { id: '2', text: 'Order the daily special and check in', xp: 20, redeemed: 12, active: false },
  ]);
  const [newChallText, setNewChallText] = useState('');
  const [newChallXp, setNewChallXp] = useState(10);
  const [showNewChall, setShowNewChall] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getBusinessSession().then(s => {
      if (s) { setSession(s); setStep('portal'); setEditDesc(s.business?.description ?? ''); }
    });
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !businessName) { setError('Please fill in all required fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const tier = selectedTier as 'free' | 'basic' | 'featured';
      const result = await registerBusinessOwner(email, password, {
        name: businessName,
        category_slug: category.toLowerCase() || 'shop',
        description,
        address,
        // Default to Plovdiv centre; admin can adjust later
        lat: 42.1354,
        lng: 24.7453,
        subscription_tier: tier,
      });
      if (result.owner) {
        setSession({ owner: result.owner });
        setStep('confirmation');
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch (e: any) { setError(e.message || 'Registration failed.'); }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const result = await loginBusinessOwner(email, password);
      if (result.owner) {
        setSession(result.owner);
        setEditDesc(result.owner.business?.description || '');
        setStep('portal');
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch (e: any) { setError(e.message || 'Login failed.'); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutBusinessOwner();
    setSession(null); setStep('landing');
  };

  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotos(p => [...p, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const toggleChallenge = (id: string) =>
    setChallenges(cs => cs.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const addChallenge = () => {
    if (!newChallText.trim()) return;
    setChallenges(cs => [...cs, { id: Date.now().toString(), text: newChallText, xp: newChallXp, redeemed: 0, active: true }]);
    setNewChallText(''); setNewChallXp(10); setShowNewChall(false);
  };

  // ── Landing ──────────────────────────────────────────────────────────────
  if (step === 'landing') {
    return (
      <div className="min-h-screen pb-28" style={{ background: 'var(--rainbow-bg)' }}>
        <div className="max-w-[430px] mx-auto px-5 pt-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: rainbowGrad, boxShadow: '0 8px 32px rgba(176,144,255,0.4)' }}>
            <Briefcase size={38} className="text-white" />
          </motion.div>

          <h1 className="text-3xl font-black text-center leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Grow your business<br />
            <span style={{ background: rainbowGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with WayGo</span>
          </h1>
          <p className="text-sm leading-relaxed text-center mb-8" style={{ color: 'var(--text-mid)' }}>
            Reach thousands of explorers discovering Plovdiv every day. Get featured on the map,
            track real foot traffic, and reward customers with bonus XP challenges.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { icon: MapPin, color: '#FF90B5', title: 'Get on the Map', desc: 'Your business appears on the WayGo map, visible to every explorer.' },
              { icon: TrendingUp, color: '#B090FF', title: 'Track Foot Traffic', desc: 'See check-in counts, peak times, and how users find you.' },
              { icon: Zap, color: '#FFB878', title: 'XP Challenges', desc: 'Create bonus challenges that drive engagement and repeat visits.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div><p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-soft)' }}>{desc}</p></div>
              </div>
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('register')}
            className="w-full py-4 rounded-2xl text-white font-black text-base mb-3"
            style={{ background: rainbowGrad, boxShadow: '0 6px 24px rgba(176,144,255,0.4)' }}>
            Register Your Business
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('login')}
            className="w-full py-4 rounded-2xl font-bold text-sm"
            style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}>
            Sign In to Business Portal
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Register (3-step wizard) ─────────────────────────────────────────────
  if (step === 'register') {
    const Field = ({ label, value, onChange, type = 'text', placeholder = '', optional = false, max }: {
      label: string; value: string; onChange: (v: string) => void;
      type?: string; placeholder?: string; optional?: boolean; max?: number;
    }) => (
      <div>
        <label className="flex gap-1 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-soft)' }}>
          {label}{optional && <span style={{ fontWeight: 400 }}>(optional)</span>}
        </label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} maxLength={max}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
      </div>
    );

    return (
      <div className="min-h-screen pb-28" style={{ background: 'var(--rainbow-bg)' }}>
        <div className="max-w-[430px] mx-auto px-5 pt-6">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => formStep === 0 ? setStep('landing') : setFormStep(f => f - 1)}
              className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-chip)' }}>
              <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
            </button>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-soft)' }}>Step {formStep + 1} of 3</p>
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                {formStep === 0 ? 'Business Info' : formStep === 1 ? 'Owner Info' : 'Choose Plan'}
              </h2>
            </div>
          </div>

          {/* Progress bars */}
          <div className="flex gap-2 mb-6">
            {[0,1,2].map(i => (
              <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                <motion.div animate={{ width: i <= formStep ? '100%' : '0%' }} transition={{ duration: 0.4 }}
                  className="h-full rounded-full" style={{ background: rainbowGrad }} />
              </div>
            ))}
          </div>

          {error && <div className="mb-4 p-3 rounded-xl text-sm text-red-600" style={{ background: '#FFF0F3', border: '1px solid #FFD0DC' }}>{error}</div>}

          <AnimatePresence mode="wait">
            {formStep === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="space-y-4">
                <Field label="Business Name" value={businessName} onChange={setBusinessName} placeholder="e.g. Kapana Coffee" />
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-soft)' }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Field label="Address" value={address} onChange={setAddress} placeholder="ul. Gladston 1, Plovdiv" />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>📍 GPS coordinates auto-detected from address on approval.</p>
                </div>
                <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+359 88 000 0000" />
                <Field label="Website" value={website} onChange={setWebsite} optional placeholder="https://your-site.com" />
                <div>
                  <label className="text-xs font-semibold mb-1.5 flex justify-between" style={{ color: 'var(--text-soft)' }}>
                    <span>Short Description</span><span style={{ color: description.length > 180 ? '#FF6080' : undefined }}>{description.length}/200</span>
                  </label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows={3} maxLength={200} placeholder="Tell explorers what makes your place special…"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <button onClick={() => { if (!businessName.trim()) { setError('Business name is required.'); return; } setError(''); setFormStep(1); }}
                  className="w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2"
                  style={{ background: rainbowGrad }}>
                  Continue <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {formStep === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="space-y-4">
                <Field label="Owner Full Name" value={ownerName} onChange={setOwnerName} placeholder="Ivan Petrov" />
                <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="ivan@example.com" />
                <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="Min. 8 characters" />
                <Field label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Repeat password" />
                <div>
                  <Field label="VAT / EIK Number" value={vatNumber} onChange={setVatNumber} optional placeholder="BG123456789" />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>Required only for invoiced plans.</p>
                </div>
                <button onClick={() => { if (!ownerName || !email || !password) { setError('Please fill all required fields.'); return; }
                  if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
                  setError(''); setFormStep(2); }}
                  className="w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2"
                  style={{ background: rainbowGrad }}>
                  Continue <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {formStep === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="space-y-3">
                {TIERS.map(tier => (
                  <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                    className="w-full text-left rounded-2xl overflow-hidden relative p-4"
                    style={{
                      background: 'var(--bg-card)',
                      border: `2px solid ${selectedTier === tier.id ? tier.color : 'var(--border)'}`,
                      boxShadow: selectedTier === tier.id ? `0 4px 20px ${tier.color}44` : 'none',
                    }}>
                    {tier.badge && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                        style={{ background: tier.color }}>{tier.badge}</span>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${tier.color}22`, border: `1.5px solid ${tier.color}44` }}>
                        {selectedTier === tier.id ? <Check size={18} style={{ color: tier.color }} /> : <Store size={16} style={{ color: tier.color }} />}
                      </div>
                      <div>
                        <p className="font-black" style={{ color: 'var(--text-primary)' }}>{tier.name}</p>
                        <p className="font-black text-lg" style={{ color: tier.color }}>
                          {tier.price === '0' ? 'Free' : `${tier.price} BGN`}
                          {tier.priceLabel && <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-soft)' }}>/{tier.priceLabel.split('/')[1]}</span>}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map(f => <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-mid)' }}><span className="shrink-0">✓</span>{f}</li>)}
                      {tier.missing.map(f => <li key={f} className="flex items-start gap-2 text-xs opacity-40" style={{ color: 'var(--text-soft)' }}><span className="shrink-0">✗</span>{f}</li>)}
                    </ul>
                  </button>
                ))}

                <button onClick={handleRegister} disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-black disabled:opacity-60"
                  style={{ background: rainbowGrad }}>
                  {loading ? 'Submitting…' : 'Submit Application'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Confirmation ──────────────────────────────────────────────────────────
  if (step === 'confirmation') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 pb-28 text-center" style={{ background: 'var(--rainbow-bg)' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#E8FFF5,#E0F8FF)', border: '2px solid #78E8C8' }}>
          <Check size={44} style={{ color: '#00A090' }} />
        </motion.div>
        <h2 className="text-2xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Application Received!</h2>
        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-mid)' }}>
          Your application has been received. Our team will review and approve your listing within <strong>48 hours</strong>.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-soft)' }}>
          You will receive a confirmation email at <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
        </p>
        <button onClick={() => { if (session) { setStep('portal'); setEditDesc(session.business?.description || ''); } else setStep('landing'); }}
          className="w-full py-4 rounded-2xl text-white font-bold"
          style={{ background: rainbowGrad }}>
          {session ? 'Go to Business Portal' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (step === 'login') {
    return (
      <div className="min-h-screen pb-28" style={{ background: 'var(--rainbow-bg)' }}>
        <div className="max-w-[430px] mx-auto px-5 pt-6">
          <button onClick={() => setStep('landing')} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-soft)' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Business Sign In</h2>
          {error && <div className="mb-4 p-3 rounded-xl text-sm text-red-600" style={{ background: '#FFF0F3', border: '1px solid #FFD0DC' }}>{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-soft)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-soft)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-black disabled:opacity-60"
              style={{ background: rainbowGrad }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <button onClick={() => setStep('register')} className="w-full text-sm" style={{ color: 'var(--text-soft)' }}>
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Portal ────────────────────────────────────────────────────────────────
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
    const isPremium = tierInfo.id === 'featured';

    return (
      <div className="min-h-screen pb-28" style={{ background: 'var(--rainbow-bg)' }}>
        <div className="max-w-[430px] mx-auto p-4 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Business Portal</h1>
              <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Manage your WayGo listing</p>
            </div>
            <button onClick={handleLogout} className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#FFF0F3', border: '1px solid #FFD0DC', color: '#FF6080' }}>Logout</button>
          </div>

          {/* Business card */}
          <div className="rounded-2xl p-4"
            style={{ background: `linear-gradient(135deg,${tierInfo.color}15,${tierInfo.color}08)`, border: `1.5px solid ${tierInfo.color}40` }}>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${tierInfo.color}22` }}>🏠</div>
              <div className="flex-1">
                <h2 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>{business.name}</h2>
                <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{business.category_slug} · {business.address || 'Plovdiv'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-white"
                    style={{ background: tierInfo.color }}>⭐ {tierInfo.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-soft)' }}>Approved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, value: '1,284', label: 'Views this month', color: '#B090FF' },
              { icon: Users, value: String(business.total_checkins || 127), label: 'Total Check-ins', color: '#78E8C8' },
              { icon: Trophy, value: '43', label: 'New Followers', color: '#FFB878' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="rounded-2xl p-3 text-center"
                style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                <Icon size={18} className="mx-auto mb-1" style={{ color }} />
                <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--text-soft)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Listing editor */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>My Listing</p>
              <button onClick={() => { setEditingDesc(!editingDesc); setEditDesc(business.description || ''); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: '#F0E8FF', color: '#B090FF', border: '1px solid #D8C8FF' }}>
                Edit
              </button>
            </div>
            {editingDesc ? (
              <div className="space-y-2">
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
                <div className="flex gap-2">
                  <button onClick={() => setEditingDesc(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>Save</button>
                  <button onClick={() => setEditingDesc(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-soft)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>
                {editDesc || business.description || 'No description yet.'}
              </p>
            )}

            {/* Photos */}
            <div className="mt-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-soft)' }}>Photos</p>
              <div className="flex gap-2 flex-wrap">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1"
                  style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--border)' }}>
                  <Camera size={18} style={{ color: 'var(--text-soft)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-soft)' }}>Add</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addPhoto} />
              </div>
            </div>
          </div>

          {/* XP Challenges (Premium only) */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Active Challenges</p>
                {!isPremium && <p className="text-xs" style={{ color: '#FFB878' }}>⚡ Upgrade to Premium to create challenges</p>}
              </div>
              {isPremium && (
                <button onClick={() => setShowNewChall(v => !v)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#FFF8F0,#FFE8D0)', color: '#FFB878', border: '1px solid #FFD0A0' }}>
                  <Plus size={13} /> New
                </button>
              )}
            </div>

            <AnimatePresence>
              {showNewChall && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3">
                  <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
                    <input value={newChallText} onChange={e => setNewChallText(e.target.value)}
                      placeholder='e.g. "Show this to the barista — earn 15 XP"'
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-soft)' }}>XP:</span>
                      <input type="number" min={5} max={100} value={newChallXp}
                        onChange={e => setNewChallXp(Number(e.target.value))}
                        className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none text-center"
                        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }} />
                      <button onClick={addChallenge}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#FFB878,#FF8030)' }}>Create</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {challenges.map(ch => (
                <div key={ch.id} className="rounded-xl p-3 flex items-center gap-3"
                  style={{
                    background: ch.active ? 'rgba(255,184,120,0.12)' : 'var(--bg-secondary)',
                    border: `1.5px solid ${ch.active ? '#FFD0A0' : 'var(--border)'}`,
                  }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ch.text}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#FFB878' }}>
                        <Zap size={11} /> +{ch.xp} XP
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-soft)' }}>{ch.redeemed} redeemed</span>
                    </div>
                  </div>
                  {isPremium && (
                    <button onClick={() => toggleChallenge(ch.id)} className="shrink-0 p-1">
                      {ch.active
                        ? <ToggleRight size={28} style={{ color: '#FFB878' }} />
                        : <ToggleLeft size={28} style={{ color: 'var(--text-soft)' }} />}
                    </button>
                  )}
                </div>
              ))}
              {challenges.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-soft)' }}>
                  No challenges yet. Create one to engage visitors!
                </p>
              )}
            </div>
          </div>

          {/* Check-in code */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Check-in Code</h2>
            <div className="rounded-xl p-4 text-center mb-2"
              style={{ background: 'linear-gradient(135deg,#1A1A3E,#2A2A50)' }}>
              <p className="text-2xl font-mono font-bold text-white tracking-widest">
                {business.id?.slice(0, 6).toUpperCase() || 'WAYGO'}
              </p>
            </div>
            <p className="text-xs text-center" style={{ color: 'var(--text-soft)' }}>Share this code with customers to check in.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
