import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface LoginPageProps { onSwitchToRegister: () => void; }

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const { t } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) return setError(t.emailRequired);
    if (!password) return setError(t.passwordRequired);
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (!result.success) setError(result.error || t.loginFailed);
  };

  const inputStyle = {
    background: 'var(--bg-input)',
    border: '1.5px solid var(--border)',
    borderRadius: 14,
    padding: '14px 14px 14px 46px',
    width: '100%',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: 15,
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFB0C8, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-10 right-0 w-56 h-56 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #88C8FF, transparent 70%)', transform: 'translateX(30%)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

          <div className="flex flex-col items-center mb-10">
            <motion.div animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4"
              style={{ background: 'linear-gradient(135deg, #FFB0C8, #C8A0FF, #88C8FF, #78E8C8)', boxShadow: '0 8px 32px rgba(176,144,255,0.4)' }}>
              🗺️
            </motion.div>
            <h1 className="text-3xl font-black" style={{ background: 'linear-gradient(135deg, #FF90B5, #B090FF, #7AC8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              WayGo
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-soft)' }}>{t.registerSubtitle}</p>
          </div>

          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>{t.loginTitle} 👋</h2>

          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} autoComplete="off">
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B090FF' }} />
              <input autoComplete="off" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailPlaceholder} style={inputStyle} />
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#B090FF' }} />
              <input autoComplete="off" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9898C0' }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center px-3 py-2 rounded-xl"
                style={{ color: '#FF6080', background: '#FFF0F3', border: '1px solid #FFD0DC' }}>
                {error}
              </motion.p>
            )}

            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isLoading}
              className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF90B5, #B090FF, #7AC8FF)', boxShadow: '0 6px 24px rgba(176,144,255,0.4)' }}>
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <>{t.login} <ArrowRight size={18} /></>
              }
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
              {t.noAccount}{' '}
              <button onClick={onSwitchToRegister} className="font-bold underline underline-offset-2" style={{ color: '#B090FF' }}>
                {t.createHere}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
