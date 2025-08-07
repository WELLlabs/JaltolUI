import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { RecoilRoot } from 'recoil';
import { PostHogProvider } from 'posthog-js/react';

// PostHog configuration
const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
  debug: import.meta.env.DEV, // Enable debug mode in development
  persistence: 'localStorage', // Use localStorage to avoid cookie domain issues
  autocapture: true, // Enable autocapture for comprehensive event tracking
  capture_pageview: true,
  capture_pageleave: true,
  disable_session_recording: false, // Keep session recording enabled
  send_feature_flags: false, // Disable feature flags for now
  loaded: (posthog) => {
    console.log('🎉 [POSTHOG main.jsx] PostHog loaded callback triggered');
    console.log('🎉 [POSTHOG main.jsx] Current distinct ID after load:', posthog.get_distinct_id());
    console.log('🎉 [POSTHOG main.jsx] PostHog config:', {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      persistence: 'localStorage',
      autocapture: true
    });
    
    // PostHog is now ready for normal operation
    // User identification will happen in PostHogIdentifier component
    console.log('🎉 [POSTHOG main.jsx] PostHog loaded and ready for identification');
    
    // Set up periodic flushing to ensure events are sent
    setInterval(() => {
      if (posthog && !posthog.has_opted_out_capturing()) {
        if (posthog.flush) {
          posthog.flush();
        }
      }
    }, 10000); // Flush every 10 seconds
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} 
      options={posthogOptions}
    >
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </PostHogProvider>
  </React.StrictMode>,
);
