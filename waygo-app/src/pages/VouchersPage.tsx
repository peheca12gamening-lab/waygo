import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, Copy, ChevronRight, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Voucher } from '../types';
import { fetchVouchers } from '../data/mockApi';
import { PARTNER_BUSINESSES } from '../data/seed';
import { useAuth } from '../context/AuthContext';

export function VouchersPage() {
  const { user, addRedeemedReward } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  useEffect(() => {
    fetchVouchers(user?.id || 'demo-user').then(data => {
      setVouchers(data);
    });
  }, [user]);

  const getBusinessName = (businessId: string) => {
    return PARTNER_BUSINESSES.find(b => b.id === businessId)?.name || 'Unknown Business';
  };

  const getDaysUntilExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getStatusColor = (voucher: Voucher) => {
    if (voucher.is_redeemed) return 'bg-gray-500/20 text-gray-400';
    const daysLeft = getDaysUntilExpiry(voucher.expires_date);
    if (daysLeft <= 0) return 'bg-red-500/20 text-red-400';
    if (daysLeft <= 3) return 'bg-amber-500/20 text-amber-400';
    return 'bg-green-500/20 text-green-400';
  };

  const getStatusText = (voucher: Voucher) => {
    if (voucher.is_redeemed) return 'Redeemed';
    const daysLeft = getDaysUntilExpiry(voucher.expires_date);
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `${daysLeft} days left`;
  };

  const handleRedeemVoucher = (voucher: Voucher) => {
    addRedeemedReward({
      businessName: getBusinessName(voucher.business_id),
      description: voucher.discount_description,
      date: new Date().toISOString(),
      pointsSpent: 0,
    });
    setSelectedVoucher(null);
  };

  const activeVouchers = vouchers.filter(v => !v.is_redeemed && getDaysUntilExpiry(v.expires_date) > 0);
  const pastVouchers = vouchers.filter(v => v.is_redeemed || getDaysUntilExpiry(v.expires_date) <= 0);

  return (
    <div className="min-h-screen bg-waygo-dark pb-24 pt-safe">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Rewards</h1>

        {/* Points balance */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-waygo-teal/20 to-waygo-amber/20 border border-waygo-teal/30 rounded-2xl p-4 mb-4 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-waygo-teal/20 flex items-center justify-center text-2xl">⭐</div>
            <div className="flex-1">
              <p className="text-white font-bold text-2xl">{user.points} <span className="text-lg font-normal text-gray-300">points</span></p>
              <p className="text-gray-400 text-xs">Earned from sights & museums</p>
            </div>
          </motion.div>
        )}

        {/* Info banner */}
        <AnimatePresence>
          {showInfoBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4 flex items-start gap-3"
            >
              <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-300 text-xs leading-relaxed">
                  <strong>Earn points</strong> by visiting sights (museums, cultural sites). <strong>Redeem points</strong> at cafes, restaurants & bars — head there on the map and check in!
                </p>
              </div>
              <button onClick={() => setShowInfoBanner(false)} className="text-blue-400 text-xs">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active ({activeVouchers.length})</h2>
          {activeVouchers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-3">🎫</p>
              <p className="text-sm">No active vouchers yet.</p>
              <p className="text-xs mt-1">Complete quests and check in at cafes to earn vouchers!</p>
            </div>
          )}
          {activeVouchers.map((voucher) => (
            <motion.button
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedVoucher(voucher)}
              className="w-full bg-gradient-to-br from-waygo-darkMid to-waygo-dark rounded-2xl overflow-hidden border border-white/10 text-left"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-waygo-amber/20 flex items-center justify-center">
                    <Ticket size={28} className="text-waygo-amber" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{voucher.discount_description}</p>
                    <p className="text-sm text-gray-400 mt-1">{getBusinessName(voucher.business_id)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voucher)}`}>
                    {getStatusText(voucher)}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 bg-waygo-darkLight flex items-center justify-between">
                <span className="text-xs text-gray-400">Tap to view QR code</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>

        {pastVouchers.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Past & Expired ({pastVouchers.length})</h2>
            {pastVouchers.map((voucher) => (
              <motion.div key={voucher.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-waygo-darkMid rounded-2xl p-4 border border-white/5 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-700/50 flex items-center justify-center">
                    <Ticket size={28} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-400">{voucher.discount_description}</p>
                    <p className="text-sm text-gray-500 mt-1">{getBusinessName(voucher.business_id)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voucher)}`}>
                    {getStatusText(voucher)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* User's redeemed rewards from auth */}
        {user && user.redeemedRewards.length > 0 && (
          <div className="space-y-3 mt-8">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Redeemed History</h2>
            {user.redeemedRewards.map(r => (
              <div key={r.id} className="bg-waygo-darkMid rounded-xl p-4 border border-white/5 flex items-center gap-3 opacity-70">
                <span className="text-2xl">🎁</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{r.description}</p>
                  <p className="text-gray-400 text-xs">{r.businessName} • {new Date(r.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voucher detail modal */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedVoucher(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-waygo-darkMid rounded-3xl p-6 max-w-sm w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-waygo-amber/20 flex items-center justify-center mx-auto mb-4">
                  <Ticket size={32} className="text-waygo-amber" />
                </div>
                <h2 className="text-xl font-bold text-white">{selectedVoucher.discount_description}</h2>
                <p className="text-gray-400 mt-2">{getBusinessName(selectedVoucher.business_id)}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-4">
                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={selectedVoucher.code} size={160} level="H" includeMargin />
                </div>
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-waygo-dark tracking-widest">{selectedVoucher.code}</span>
                  <button onClick={() => copyCode(selectedVoucher.code)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Copy size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <Clock size={16} />
                <span>{getStatusText(selectedVoucher)}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedVoucher(null)} className="flex-1 py-3 bg-waygo-darkLight text-white font-semibold rounded-xl">Close</button>
                <button onClick={() => handleRedeemVoucher(selectedVoucher)} className="flex-1 py-3 bg-waygo-teal text-white font-semibold rounded-xl">
                  Mark as Used
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
