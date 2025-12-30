
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MFAVerification from "./pages/MFAVerification";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Agents from "./pages/Agents";
import Activities from "./pages/Activities";
import Investigations from "./pages/Investigations";
import InvestigationEpisode from "./pages/InvestigationEpisode";
import InferenceDetail from "./pages/InferenceDetail";
import AgentRegistration from "./pages/AgentRegistration";
import AgentDetail from "./pages/AgentDetail";
import ProxmoxDetails from "./pages/ProxmoxDetails";
import Proxmox from "./pages/Proxmox";
import LxcDetail from "./pages/LxcDetail";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import Cookies from "./pages/Cookies";
import Status from "./pages/Status";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import License from "./pages/License";
import Security from "./pages/Security";
import Features from "./pages/Features";
import UseCases from "./pages/UseCases";
import HowItWorks from "./pages/HowItWorks";
import Trademarks from "./pages/Trademarks";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import CookieConsent from "./components/CookieConsent";

import PatchManagement from "./pages/PatchManagement";
import PatchHistory from "./pages/PatchHistory";
import PatchExecutionDetail from "./pages/PatchExecutionDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mfa-verification" element={<MFAVerification />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/account" element={<Account />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/agents/:id/proxmox" element={<ProxmoxDetails />} />
              <Route path="/proxmox" element={<Proxmox />} />
              <Route path="/proxmox/lxc/:lxcId" element={<LxcDetail />} />
              <Route path="/patch-management/:agentId" element={<PatchManagement />} />
              <Route path="/patch-history/:agentId" element={<PatchHistory />} />
              <Route path="/patch-history" element={<PatchHistory />} />
              <Route path="/patch-execution/:executionId" element={<PatchExecutionDetail />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/investigations" element={<Investigations />} />
              <Route path="/investigations/:investigationId" element={<InvestigationEpisode />} />
              <Route path="/investigations/:investigationId/inference/:inferenceId" element={<InferenceDetail />} />
              <Route path="/agents/register" element={<AgentRegistration />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/status" element={<Status />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/license" element={<License />} />
              <Route path="/security" element={<Security />} />
              <Route path="/features" element={<Features />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/trademarks" element={<Trademarks />} />
              <Route path="/support" element={<Support />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
