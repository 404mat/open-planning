import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastContext, Toast, ToastInput } from './toast-context';

import { SuccessToast } from '@/components/toasts/success-toast';
import { ErrorToast } from '@/components/toasts/error-toast';
import { InfoToast } from '@/components/toasts/info-toast';
import { WarningToast } from '@/components/toasts/warning-toast';

const renderToastComponent = (toast: Toast) => {
  const common = { text: toast.text };

  switch (toast.type) {
    case 'success':
      return <SuccessToast {...common} />;
    case 'error':
      return <ErrorToast {...common} />;
    case 'warning':
      return <WarningToast {...common} />;
    default:
      return <InfoToast {...common} />;
  }
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(({ text, type = 'info' }: ToastInput) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

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
            >
              {renderToastComponent(t)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
