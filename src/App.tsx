
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Simulation from "./pages/Simulation";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import { useState, useEffect } from "react";

// Create a new query client
const queryClient = new QueryClient();

const App = () => {
  const [isClerkAvailable, setIsClerkAvailable] = useState<boolean | null>(null);
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  useEffect(() => {
    // Check if Clerk publishable key is available
    setIsClerkAvailable(!!publishableKey);
  }, [publishableKey]);

  const renderWithClerk = () => (
    <ClerkProvider 
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-in"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );

  const renderWithoutClerk = () => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isClerkAvailable ? renderWithClerk() : renderWithoutClerk()}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
