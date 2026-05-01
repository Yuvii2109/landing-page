import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Registration from "./pages/Registration.tsx";
import RegistrationContinuation from "./pages/RegistrationContinuation.tsx";
import RegistrationsDashboard from "./pages/RegistrationsDashboard.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsAndConditions from "./pages/TermsAndConditions.tsx";
import NationalAchievement from "./pages/NationalAchievement.tsx";
import SchoolPerformance from "./pages/SchoolPerformance.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/national-achievement" element={<NationalAchievement />} />
          <Route path="/school-performance" element={<SchoolPerformance />} />
          <Route path="/nation-achievement" element={<Navigate to="/national-achievement" replace />} />
          <Route path="/registration/admin" element={<RegistrationsDashboard />} />
          <Route path="/registeration" element={<Navigate to="/registration/admin" replace />} />
          <Route path="/registration/continue" element={<RegistrationContinuation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
