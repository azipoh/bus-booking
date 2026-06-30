import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "./components/Navbar";
// Eager-load the landing page so first paint is instant; lazy-load the rest.
import Index from "./pages/Index";
const SearchResults = lazy(() => import("./pages/SearchResults"));
const SeatSelection = lazy(() => import("./pages/SeatSelection"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const SendParcel = lazy(() => import("./pages/SendParcel"));
const TrackParcel = lazy(() => import("./pages/TrackParcel"));
const MyParcels = lazy(() => import("./pages/MyParcels"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminBuses = lazy(() => import("./pages/AdminBuses"));
const AdminBookings = lazy(() => import("./pages/AdminBookings"));
const AdminSchedules = lazy(() => import("./pages/AdminSchedules"));
const AdminParcels = lazy(() => import("./pages/AdminParcels"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminBranches = lazy(() => import("./pages/AdminBranches"));
const AdminBranchDetail = lazy(() => import("./pages/AdminBranchDetail"));
const ManagerBranch = lazy(() => import("./pages/ManagerBranch"));
const ManagerReports = lazy(() => import("./pages/ManagerReports"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/select-seat/:scheduleId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
                <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/track-parcel" element={<TrackParcel />} />
                <Route path="/admin/send-parcel" element={<ProtectedRoute requireStaff><AdminLayout><SendParcel /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/my-parcels" element={<ProtectedRoute requireStaff><AdminLayout><MyParcels /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireStaff><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/buses" element={<ProtectedRoute requireStaff><AdminLayout><AdminBuses /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute requireStaff><AdminLayout><AdminBookings /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/schedules" element={<ProtectedRoute requireStaff><AdminLayout><AdminSchedules /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/parcels" element={<ProtectedRoute requireStaff><AdminLayout><AdminParcels /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requireStaff><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/branches" element={<ProtectedRoute requireAdmin><AdminLayout><AdminBranches /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/branch/:branchId" element={<ProtectedRoute requireAdmin><AdminLayout><AdminBranchDetail /></AdminLayout></ProtectedRoute>} />
                <Route path="/cashier/register-parcel" element={<ProtectedRoute allowedRoles={['cashier']}><SendParcel /></ProtectedRoute>} />
                <Route path="/cashier/parcels" element={<ProtectedRoute allowedRoles={['cashier']}><AdminLayout><AdminParcels /></AdminLayout></ProtectedRoute>} />
                <Route path="/manager/branch" element={<ProtectedRoute allowedRoles={['manager']}><AdminLayout><ManagerBranch /></AdminLayout></ProtectedRoute>} />
                <Route path="/manager/schedules" element={<ProtectedRoute allowedRoles={['manager']}><AdminLayout><AdminSchedules /></AdminLayout></ProtectedRoute>} />
                <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={['manager']}><AdminLayout><ManagerReports /></AdminLayout></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
