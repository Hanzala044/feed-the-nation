import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load pages for code splitting
const DonorDashboard = lazy(() => import("./pages/donor/DonorDashboard"));
const CreateDonation = lazy(() => import("./pages/donor/CreateDonation"));
const EditDonation = lazy(() => import("./pages/donor/EditDonation"));
const EditDonorProfile = lazy(() => import("./pages/donor/EditProfile"));
const VolunteerDashboard = lazy(() => import("./pages/volunteer/VolunteerDashboard"));
const EditVolunteerProfile = lazy(() => import("./pages/volunteer/EditProfile"));
const DonationDetail = lazy(() => import("./pages/DonationDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicFeed = lazy(() => import("./pages/PublicFeed"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const QRScanner = lazy(() => import("./pages/QRScanner"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/donor/create-donation" element={<CreateDonation />} />
              <Route path="/donor/edit-donation/:id" element={<EditDonation />} />
              <Route path="/donor/edit-profile" element={<EditDonorProfile />} />
              <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
              <Route path="/volunteer/edit-profile" element={<EditVolunteerProfile />} />
              <Route path="/donation/:id" element={<DonationDetail />} />
              <Route path="/profile/:userId?" element={<Profile />} />
              <Route path="/feed" element={<PublicFeed />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
