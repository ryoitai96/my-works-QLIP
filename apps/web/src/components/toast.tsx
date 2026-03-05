'use client';

import { useCallback, useEffect, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

let nextId = 0;
let addToast: ((text: string, type: ToastType) => void) | null = null;

export function showToast(text: string, type: ToastType = 'success') {
  addToast?.(text, type);
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgColor = toast.type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = toast.type === 'success' ? '✓' : '!';

  return (
    <div
      className={`${bgColor} toast-enter flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg`}
      role="status"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
        {icon}
      </span>
      {toast.text}
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToast = (text: string, type: ToastType) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, text, type }]);
    };
    return () => {
      addToast = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}
