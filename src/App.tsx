
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  
  useEffect(() => {
    // Check if Clerk is available by checking if window.Clerk exists
    const checkClerk = async () => {
      try {
        // @ts-ignore - we're checking if Clerk exists on window
        const hasClerk = typeof window.Clerk !== 'undefined';
        setIsClerkAvailable(hasClerk);
      } catch (error) {
        console.error("Error checking Clerk availability:", error);
        setIsClerkAvailable(false);
      }
    };
    
    checkClerk();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
