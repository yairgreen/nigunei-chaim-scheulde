
import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import Layout from '@/components/Layout';

const SignIn = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold mb-8 text-center">כניסה למערכת</h1>
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
      </div>
    </Layout>
  );
};

export default SignIn;
