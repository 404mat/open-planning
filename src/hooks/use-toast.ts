import { useContext } from 'react';
import { ToastContext, ToastInput } from '@/context/toast-context';

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');

  const { showToast } = ctx;

  return {
    toast: (toast: ToastInput) => showToast(toast),
    successToast: (toast: Omit<ToastInput, 'type'>) =>
      showToast({ ...toast, type: 'success' }),
    errorToast: (toast: Omit<ToastInput, 'type'>) =>
      showToast({ ...toast, type: 'error' }),
    infoToast: (toast: Omit<ToastInput, 'type'>) =>
      showToast({ ...toast, type: 'info' }),
    warningToast: (toast: Omit<ToastInput, 'type'>) =>
      showToast({ ...toast, type: 'warning' }),
  };
};
