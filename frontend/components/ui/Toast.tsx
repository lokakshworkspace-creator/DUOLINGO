"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slight delay before animating in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Hide after duration
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation before unmounting
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-duo-green',
    error: 'bg-duo-red',
    info: 'bg-duo-blue'
  };

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -20, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`px-6 py-3 rounded-2xl shadow-xl font-extrabold text-white ${bgColors[type]}`}
    >
      {message}
    </motion.div>
  );
}

// Simple Toast Manager singleton for global usage
let toastListener: ((message: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (msg: string) => toastListener && toastListener(msg, 'success'),
  error: (msg: string) => toastListener && toastListener(msg, 'error'),
  info: (msg: string) => toastListener && toastListener(msg, 'info'),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<{id: number, msg: string, type: ToastType}[]>([]);

  useEffect(() => {
    let idCounter = 0;
    toastListener = (msg: string, type: ToastType) => {
      const id = idCounter++;
      setToasts(prev => [...prev, { id, msg, type }]);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.msg} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
