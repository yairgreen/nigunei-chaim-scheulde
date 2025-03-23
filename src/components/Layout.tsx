
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideLogin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideLogin = false }) => {
  // Safely check if Clerk is available
  let isSignedIn = false;
  
  try {
    // Only try to use Clerk if it's available in the window object
    // @ts-ignore - we're checking if Clerk exists on window
    if (typeof window.Clerk !== 'undefined') {
      // Only import useUser if Clerk is available
      const { useUser } = require('@clerk/clerk-react');
      const userHook = useUser();
      isSignedIn = userHook.isSignedIn;
    }
  } catch (error) {
    console.error("Error using Clerk hooks in Layout:", error);
    isSignedIn = false;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <nav className="bg-white border-b py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-end gap-2">
          {!isSignedIn && !hideLogin && (
            <Link to="/sign-in">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <User className="h-4 w-4 ml-2" />
                כניסה
              </Button>
            </Link>
          )}
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
