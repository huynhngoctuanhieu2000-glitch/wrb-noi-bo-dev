'use client';

import { useEffect } from 'react';

/**
 * Component to register the service worker for PWA support.
 * Must be rendered inside a client component tree.
 */
const ServiceWorkerRegister = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegister;
