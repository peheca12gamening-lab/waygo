import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, Copy, ChevronRight, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getVouchers } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export function VouchersPage() {
  const { user, addRedeemedReward } = useAuth();
  const { t } = useApp();
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const { data: vouchers = [] } = useQuery({
    queryKey: ['vouchers', user?.id],
    queryFn: () => getVouchers(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60,
  });

  const getBusinessName = (v: any) => v.vouchers?.businesses?.name ?? 'Unknown Business';

  const getDaysUntilExpiry = (dateString: string) => {
    const diffMs = new Date(dateString).getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const copyCode = (code: string) => navigator.clipboard.writeText(code);

  const getStatusColor = (v: any) => {
    if (v.is_redeemed) return { bg: 'var(--bg-chip)', color: 'var(--text-soft)' };
    const daysLeft = getDaysUntilExpiry(v.expires_at);
    if (daysLeft <= 0) return { bg: '#FFE8E8', color: '#FF6080' };
    if (daysLeft <= 3) return { bg: '#FFF3E0', color: '#FFB878' };
    return { bg: '#E8FFF5', color: '#00A090' };
  };

  const getStatusText = (v: any) => {
    if (v.is_redeemed) return t.redeemed;
    const daysLeft = getDaysUntilExpiry(v.expires_at);
    if (daysLeft <= 0) return t.expired;
    if (daysLeft === 1) return t.expiresTomorrow;
    return `${daysLeft} ${t.daysLeft}`;
  };

  const handleRedeemVoucher = (v: any) => {
    addRedeemedReward({
      businessName: getBusinessName(v),
      description: v.vouchers?.discount_description ?? '',
      date: new Date().toISOString(),
      pointsSpent: 0,
    });
    setSelectedVoucher(null);
  };

  const activeVouchers = vouchers.filter((v: any) => !v.is_redeemed && getDaysUntilExpiry(v.expires_at) > 0);
  const pastVouchers = vouchers.filter((v: any) => v.is_redeemed || getDaysUntilExpiry(v.expires_at) <= 0);

  return (
    <div className="min-h-screen pb-24 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t.rewards}</h1>

        {user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #F0E8FF, #E8F0FF)', border: '1.5px solid #D8D0FF' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF)' }}>⭐</div>
            <div className="flex-1">
              <p className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{user.points} <span className="text-base font-normal" style={{ color: 'var(--text-soft)' }}>{t.points}</span></p>
              <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.earnPointsHint}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showInfoBanner && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl p-3 mb-4 flex items-start gap-3"
              style={{ background: '#E8F0FF', border: '1.5px solid #C0D8FF' }}>
              <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs leading-relaxed" style={{ color: '#4060A0' }}>{t.earnPointsHint}</p>
              </div>
              <button onClick={() => setShowInfoBanner(false)} className="text-blue-400 text-xs">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{t.active} ({activeVouchers.length})</h2>
          {activeVouchers.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-soft)' }}>
              <p className="text-4xl mb-3">🎫</p>
              <p className="text-sm">{t.noActiveVouchers}</p>
              <p className="text-xs mt-1">{t.earnVouchersHint}</p>
            </div>
          )}
          {activeVouchers.map((voucher: any) => {
            const sc = getStatusColor(voucher);
            return (
              <motion.button key={voucher.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedVoucher(voucher)}
                className="w-full rounded-2xl overflow-hidden text-left"
                style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FFE0B0,#FFD0D0)' }}>
                      <Ticket size={28} style={{ color: '#FF8C42' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{voucher.vouchers?.discount_description ?? 'Discount'}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-soft)' }}>{getBusinessName(voucher)}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>
                      {getStatusText(voucher)}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg-secondary)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.tapForQr}</span>
                  <ChevronRight size={16} style={{ color: 'var(--text-soft)' }} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {pastVouchers.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{t.pastExpired} ({pastVouchers.length})</h2>
            {pastVouchers.map((voucher: any) => {
              const sc = getStatusColor(voucher);
              return (
                <motion.div key={voucher.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-2xl p-4 opacity-60" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-chip)' }}>
                      <Ticket size={28} style={{ color: 'var(--text-soft)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--text-soft)' }}>{voucher.vouchers?.discount_description ?? 'Discount'}</p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-soft)' }}>{getBusinessName(voucher)}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>
                      {getStatusText(voucher)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedVoucher && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelectedVoucher(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="rounded-3xl p-6 max-w-sm w-full"
              style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#FFE0B0,#FFD0D0)' }}>
                  <Ticket size={32} style={{ color: '#FF8C42' }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedVoucher.vouchers?.discount_description ?? 'Discount'}</h2>
                <p className="mt-2" style={{ color: 'var(--text-soft)' }}>{getBusinessName(selectedVoucher)}</p>
              </div>

              <div className="rounded-2xl p-6 mb-4" style={{ background: 'white' }}>
                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={selectedVoucher.vouchers?.code ?? ''} size={160} level="H" includeMargin />
                </div>
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: '#F5F5FF' }}>
                  <span className="text-2xl font-mono font-bold tracking-widest" style={{ color: '#1A1A3E' }}>{selectedVoucher.vouchers?.code ?? ''}</span>
                  <button onClick={() => copyCode(selectedVoucher.vouchers?.code ?? '')} className="p-2 rounded-lg transition-colors" style={{ background: '#EAEAF8' }}>
                    <Copy size={20} style={{ color: '#5858A0' }} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-soft)' }}>
                <Clock size={16} />
                <span>{getStatusText(selectedVoucher)}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedVoucher(null)} className="flex-1 py-3 rounded-xl font-semibold"
                  style={{ background: 'var(--bg-chip)', color: 'var(--text-primary)' }}>{t.close}</button>
                <button onClick={() => handleRedeemVoucher(selectedVoucher)} className="flex-1 py-3 rounded-xl text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg,#00C4B8,#009A90)' }}>{t.markAsUsed}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
