
import React, { useEffect, useState } from 'react';
import { SignIn as ClerkSignIn, useClerk } from '@clerk/clerk-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const SignIn = () => {
  const [isClerkAvailable, setIsClerkAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if Clerk is available
    try {
      const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
      setIsClerkAvailable(!!publishableKey);
      
      if (!publishableKey) {
        toast({
          title: "התראת התחברות",
          description: "מערכת ההתחברות אינה זמינה כרגע. נדרש מפתח Clerk תקין.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking Clerk availability:", error);
      setIsClerkAvailable(false);
    }
  }, [toast]);
  
  const handleDemoLogin = () => {
    toast({
      title: "כניסה במצב דמו",
      description: "נכנסת במצב דמו. חלק מהתכונות לא יהיו זמינות.",
    });
    navigate('/');
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">כניסה למערכת</h1>
        
        {isClerkAvailable ? (
          <ClerkSignIn 
            redirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                formFieldInput: 'border border-input focus:border-primary',
                card: 'shadow-md p-6 rounded-xl',
                headerTitle: 'text-2xl font-bold',
                headerSubtitle: 'text-gray-500',
              }
            }}
          />
        ) : (
          <div className="bg-white shadow-md p-6 rounded-xl text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="text-red-500 h-12 w-12" />
            </div>
            <p className="mb-4 text-red-600 font-medium">מערכת ההתחברות אינה זמינה כרגע</p>
            <p className="mb-6 text-gray-600">
              יש להגדיר את המשתנה הסביבתי VITE_CLERK_PUBLISHABLE_KEY עם מפתח תקין מ-Clerk
            </p>
            <div className="flex flex-col gap-4">
              <Button onClick={handleDemoLogin}>כניסה במצב דמו</Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                חזרה לדף הראשי
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SignIn;
