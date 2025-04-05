import { createContext } from 'react';

export type Toast = {
  id: number;
  title?: string;
  description: string;
  type?: 'success' | 'error' | 'info' | 'warning';
};

export type ToastInput = {
  title?: string;
  description: string;
  type?: Toast['type'];
};

export type ToastContextType = {
  showToast: (toast: ToastInput) => void;
  toasts: Toast[];
};

export const ToastContext = createContext<ToastContextType | null>(null);
