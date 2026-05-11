import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import SeatSelection from "./pages/SeatSelection";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import SendParcel from "./pages/SendParcel";
import TrackParcel from "./pages/TrackParcel";
import MyParcels from "./pages/MyParcels";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBuses from "./pages/AdminBuses";
import AdminBookings from "./pages/AdminBookings";
import AdminSchedules from "./pages/AdminSchedules";
import AdminParcels from "./pages/AdminParcels";
import AdminSettings from "./pages/AdminSettings";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/select-seat/:scheduleId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
            <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/track-parcel" element={<TrackParcel />} />
            <Route path="/admin/send-parcel" element={<ProtectedRoute requireAdmin><SendParcel /></ProtectedRoute>} />
            <Route path="/admin/my-parcels" element={<ProtectedRoute requireAdmin><MyParcels /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/buses" element={<ProtectedRoute requireAdmin><AdminBuses /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/schedules" element={<ProtectedRoute requireAdmin><AdminSchedules /></ProtectedRoute>} />
            <Route path="/admin/parcels" element={<ProtectedRoute requireAdmin><AdminParcels /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
