import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BookingPage from "@/pages/booking-page";
import PaymentPage from "@/pages/payment-page";
import BookingConfirmation from "@/pages/booking-confirmation";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTrips from "@/pages/admin/trips";
import AdminManifests from "@/pages/admin/manifests";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/book/:propertySlug" component={BookingPage} />
      <Route path="/payment/:bookingId" component={PaymentPage} />
      <Route path="/confirmation/:bookingId" component={BookingConfirmation} />
      
      {/* Admin routes (protected) */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/trips" component={AdminTrips} adminOnly />
      <ProtectedRoute path="/admin/manifests" component={AdminManifests} adminOnly />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
