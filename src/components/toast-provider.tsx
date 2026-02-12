'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: '!bg-panel-light dark:!bg-panel !text-current !text-sm !rounded-xl !shadow-xl',
        duration: 3000,
      }}
    />
  );
}
