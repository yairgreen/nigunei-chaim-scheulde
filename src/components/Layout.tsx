
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { Button } from './ui/button';
import { User, Calendar } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSignedIn } = useUser();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <nav className="bg-white border-b py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-end gap-2">
          <Link to="/simulation">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Calendar className="h-4 w-4 ml-2" />
              סימולציה
            </Button>
          </Link>
          
          {isSignedIn ? (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <User className="h-4 w-4 ml-2" />
                ניהול
              </Button>
            </Link>
          ) : (
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
      
      <Footer />
    </div>
  );
};

export default Layout;
