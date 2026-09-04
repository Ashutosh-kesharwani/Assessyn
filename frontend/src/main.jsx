/**
 * main.jsx — Application entry point
 *
 * Auth state is managed by Zustand (authStore) with localStorage persistence.
 * Admin auth state is managed by AdminAuthContext (separate context).
 * AppProvider handles UI-level global state (sidebar, theme).
 *
 * Provider order: BrowserRouter → QueryClientProvider → AdminAuthProvider → AppProvider → App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppProvider, AdminAuthProvider } from '@/context';
import App from './App';
import './index.css';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminAuthProvider>
          <AppProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color:      'var(--toast-text)',
                  border:     '1px solid var(--toast-border)',
                  borderRadius: '14px',
                  fontSize:   '13px',
                  boxShadow:  'var(--card-shadow)',
                  fontWeight: '500',
                  backdropFilter: 'blur(12px)',
                },
                success: { iconTheme: { primary: 'var(--accent-primary)', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </AppProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
