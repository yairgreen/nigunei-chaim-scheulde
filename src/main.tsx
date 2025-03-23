import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidKey = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('placeholder');

// Render the app with or without Clerk based on key availability
const AppWithAuth = () => {
  // If we have a valid publishable key, wrap with ClerkProvider
  if (isValidKey) {
    return (
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        clerkJSVersion="5.56.0-snapshot.v20250312225817"
        allowedRedirectOrigins={[window.location.origin]}
      >
        <App />
      </ClerkProvider>
    );
  }
  
  // Otherwise, render App without authentication
  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>,
);
