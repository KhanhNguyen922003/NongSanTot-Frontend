import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './router';
import { queryClient } from '@/queries';
import { handleAuthInvalidate } from '@/queries/Auth/useAuth';
import './index.css';

handleAuthInvalidate();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>,
);
