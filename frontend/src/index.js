import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

//  1. Import QueryClient and Provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevents data from being refetched too aggressively
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Don't refetch every time user clicks back into the tab
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/*  3. Wrap App in the Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();