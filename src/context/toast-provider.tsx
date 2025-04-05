import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastContext, Toast, ToastInput } from './toast-context';

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    ({ description, title, type = 'info' }: ToastInput) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const getColor = (type?: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, toasts }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className={`text-white px-4 py-3 rounded shadow ${getColor(t.type)}`}
            >
              {t.title && <div className="font-semibold mb-1">{t.title}</div>}
              <div className="text-sm leading-snug">{t.description}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
