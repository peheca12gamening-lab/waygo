import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps { onSwitchToLogin: () => void; }

const PARROT_AVATARS = [
  { src: '/avatars/parrot-holo.png',   label: 'Holographic', color: '#78E8C8' },
  { src: '/avatars/parrot-fire.png',   label: 'Fire',        color: '#FFB878' },
  { src: '/avatars/parrot-pink.png',   label: 'Rose',        color: '#FF90B5' },
  { src: '/avatars/parrot-blue.png',   label: 'Ocean',       color: '#7AC8FF' },
  { src: '/avatars/parrot-dark.png',   label: 'Shadow',      color: '#8090A0' },
  { src: '/avatars/parrot-purple.png', label: 'Cosmic',      color: '#B090FF' },
];

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Avatar state – parrot or custom upload
  const [selectedAvatar, setSelectedAvatar] = useState(PARROT_AVATARS[0].src);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeAvatar = customAvatar || selectedAvatar;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCustomAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true);
    // Pass the chosen avatar (parrot or custom) into register
    const result = await register(name.trim(), email.trim(), password, activeAvatar);
    setIsLoading(false);
    if (!result.success) setError(result.error || 'Registration failed.');
  };

  const inputStyle = {
    background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 14,
    padding: '14px 14px 14px 46px', width: '100%', color: 'var(--text-primary)', outline: 'none', fontSize: 15,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#FFB0C8,transparent 70%)', transform: 'translate(-30%,-30%)' }} />
      <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#C8A0FF,transparent 70%)', transform: 'translate(30%,-30%)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <motion.div animate={{ y: [0,-8,0], rotate: [0,3,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-3"
              style={{ background: 'linear-gradient(135deg,#FFB0C8,#C8A0FF,#88C8FF,#78E8C8)', boxShadow: '0 8px 32px rgba(176,144,255,0.4)' }}>
              🗺️
            </motion.div>
            <h1 className="text-3xl font-black" style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WayGo</h1>
            <p className="text-waygo-textSoft text-sm mt-1">Explore Plovdiv. Earn rewards.</p>
          </div>

          <h2 className="text-xl font-bold text-waygo-text mb-4 text-center">Create your account</h2>

          {/* AVATAR PREVIEW + PICKER */}
          <div className="flex flex-col items-center mb-5">
            {/* Big preview of chosen avatar */}
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden p-0.5"
                style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF,#78E8C8)' }}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src={activeAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Upload button overlay */}
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>
                <Camera size={12} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>

            {/* Parrot picker row */}
            <p className="text-xs font-semibold text-waygo-textSoft mb-2 uppercase tracking-wider">Or choose an explorer</p>
            <div className="flex gap-2">
              {PARROT_AVATARS.map((p) => {
                const isActive = !customAvatar && selectedAvatar === p.src;
                return (
                  <motion.button key={p.src} whileTap={{ scale: 0.88 }}
                    onClick={() => { setSelectedAvatar(p.src); setCustomAvatar(null); }}
                    className="w-10 h-10 rounded-full overflow-hidden transition-all"
                    style={{
                      border: isActive ? `2.5px solid ${p.color}` : '2px solid #E0E0F5',
                      boxShadow: isActive ? `0 3px 12px ${p.color}55` : 'none',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      background: 'var(--bg-input)',
                    }}>
                    <img src={p.src} alt={p.label} className="w-full h-full object-contain" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B090FF' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </div>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B090FF' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={inputStyle} />
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B090FF' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min. 6 chars)" style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9898C0' }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B090FF' }} />
              <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9898C0' }}>
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center px-3 py-2 rounded-xl"
                style={{ color: '#FF6080', background: '#FFF0F3', border: '1px solid #FFD0DC' }}>
                {error}
              </motion.p>
            )}

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isLoading}
              className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF)', boxShadow: '0 6px 24px rgba(176,144,255,0.4)' }}>
              {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <> Create Account <ArrowRight size={18} /> </>}
            </motion.button>
          </div>

          <div className="mt-5 text-center">
            <p className="text-waygo-textSoft text-sm">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="font-bold underline underline-offset-2" style={{ color: '#B090FF' }}>
                Login from here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
