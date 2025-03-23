
import React, { useEffect, useState } from 'react';
import { SignIn as ClerkSignIn, useClerk } from '@clerk/clerk-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SignIn = () => {
  const [isClerkAvailable, setIsClerkAvailable] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if Clerk is available
    try {
      // @ts-ignore - we're checking if Clerk exists on window
      const hasClerk = typeof window.Clerk !== 'undefined';
      setIsClerkAvailable(hasClerk);
      
      if (!hasClerk) {
        toast({
          title: "התראת התחברות",
          description: "מערכת ההתחברות אינה זמינה כרגע. יש להגדיר מפתח Clerk תקין.",
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
    navigate('/admin');
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">כניסה למערכת</h1>
        
        {isClerkAvailable ? (
          <ClerkSignIn 
            signUpUrl="/"
            redirectUrl="/admin"
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
            <p className="mb-4 text-red-600">מערכת ההתחברות אינה זמינה כרגע</p>
            <p className="mb-6 text-gray-600">יש להגדיר את המשתנה הסביבתי VITE_CLERK_PUBLISHABLE_KEY עם מפתח תקין מ-Clerk</p>
            <Button onClick={handleDemoLogin}>כניסה במצב דמו</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SignIn;
