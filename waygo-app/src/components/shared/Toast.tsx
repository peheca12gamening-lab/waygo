import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: '#E8FFF5', color: '#00A090', border: '#C0F0E0' },
  error: { bg: '#FFF0F3', color: '#FF6080', border: '#FFD0DC' },
  info: { bg: '#F0E8FF', color: '#B090FF', border: '#E0D0FF' },
};

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[100] max-w-[430px] mx-auto pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = icons[toast.type];
            const c = colors[toast.type];
            return (
              <motion.div key={toast.id}
                initial={{ opacity: 0, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 pointer-events-auto shadow-lg"
                style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
                <Icon size={18} style={{ color: c.color, flexShrink: 0 }} />
                <p className="text-sm font-medium flex-1" style={{ color: c.color }}>{toast.message}</p>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0">
                  <X size={16} style={{ color: c.color, opacity: 0.6 }} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
