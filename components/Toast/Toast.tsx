'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // milliseconds; default 4000
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, variant, title, message, duration = 4000 } = toast;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const Icon = variant === 'success' ? CheckCircle2 : variant === 'error' ? XCircle : Info;
  const variantClass = variant === 'success' ? styles.success : variant === 'error' ? styles.error : styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`${styles.toast} ${variantClass}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={20} className={styles.icon} />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {message && <div className={styles.message}>{message}</div>}
      </div>
      <button
        className={styles.closeBtn}
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className={styles.container} aria-live="polite" aria-atomic="false">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
