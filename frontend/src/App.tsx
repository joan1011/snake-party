import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { AuthModal } from "@/components/auth/AuthModal";
import { GamePage } from "./pages/GamePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { SpectatePage } from "./pages/SpectatePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header onLoginClick={() => setAuthModalOpen(true)} />
            <main>
              <Routes>
                <Route path="/" element={<GamePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/spectate" element={<SpectatePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
