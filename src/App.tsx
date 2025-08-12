import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import RolePlay from "./pages/RolePlay";
import Story from "./pages/Story";
import AboutMe from "./pages/AboutMe";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OnboardingIndex from "./pages/OnboardingIndex";
import OnboardingAlwaysNever from "./pages/OnboardingAlwaysNever";
import OnboardingAgreeDisagree from "./pages/OnboardingAgreeDisagree";
import Training from "./pages/Training";
import AdminExam from "./pages/AdminExam";
import AdminRoute from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="auth" element={<Auth />} />

              <Route element={<ProtectedRoute />}>
                <Route path="onboarding" element={<OnboardingIndex />} />
                <Route path="onboarding/always-never" element={<OnboardingAlwaysNever />} />
                <Route path="onboarding/agree-disagree" element={<OnboardingAgreeDisagree />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="role-play" element={<RolePlay />} />
                <Route path="story" element={<Story />} />
                <Route path="about-me" element={<AboutMe />} />
                <Route path="settings" element={<Settings />} />
                <Route element={<AdminRoute />}>
                  <Route path="training" element={<Training />} />
                  <Route path="admin/exam" element={<AdminExam />} />
                </Route>
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
