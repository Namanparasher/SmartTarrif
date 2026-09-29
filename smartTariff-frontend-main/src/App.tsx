import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { store } from "@/store/store";
import { initDemoData } from "@/utils/seedInit";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";

import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import PlansPage from "@/pages/plans/PlansPage";
import PlanDetailsPage from "@/pages/plans/PlanDetailsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import DashboardPage from "@/pages/customer/DashboardPage";
import UsagePage from "@/pages/customer/UsagePage";
import RecommendationDetailPage from "@/pages/customer/RecommendationDetailPage";
import ComparePage from "@/pages/customer/ComparePage";
import HistoryPage from "@/pages/customer/HistoryPage";
import ProfilePage from "@/pages/customer/ProfilePage";
import PreferencesPage from "@/pages/customer/PreferencesPage";

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminCustomerDetailPage from "@/pages/admin/AdminCustomerDetailPage";
import AdminPlansPage from "@/pages/admin/AdminPlansPage";
import AdminPlanFormPage from "@/pages/admin/AdminPlanFormPage";
import AdminUsagePage from "@/pages/admin/AdminUsagePage";
import AdminRecommendationsPage from "@/pages/admin/AdminRecommendationsPage";
import AdminFeedbackPage from "@/pages/admin/AdminFeedbackPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

initDemoData();

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCurrentUser() as any);
  }, [dispatch]);
  return children;
}

function AdaptivePlanLayout() {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  if (isAuthenticated && isCustomer) {
    return <DashboardLayout variant="customer" />;
  }
  if (isAuthenticated && isAdmin) {
    return <DashboardLayout variant="admin" />;
  }
  return <PublicLayout />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Adaptive Plan Catalogue routes */}
      <Route element={<AdaptivePlanLayout />}>
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/plans/:id" element={<PlanDetailsPage />} />
      </Route>

      {/* Customer routes */}
      <Route element={<ProtectedRoute roles={["customer"]} />}>
        <Route element={<DashboardLayout variant="customer" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/find-plan" element={<Navigate to="/dashboard" replace />} />
          <Route path="/recommendations" element={<Navigate to="/dashboard" replace />} />
          <Route path="/recommendations/:id" element={<RecommendationDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<PreferencesPage />} />
          <Route path="/usage" element={<UsagePage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<DashboardLayout variant="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route path="/admin/plans/create" element={<AdminPlanFormPage />} />
          <Route path="/admin/plans/:id/edit" element={<AdminPlanFormPage />} />
          <Route path="/admin/usage" element={<AdminUsagePage />} />
          <Route path="/admin/recommendations" element={<AdminRecommendationsPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthBootstrap>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#081936",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "600",
                borderRadius: "12px",
              },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthBootstrap>
    </Provider>
  );
}
