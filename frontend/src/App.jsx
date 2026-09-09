import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";
import ProtectedRoute from "./components/auth/ProtectedRoute";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><DashboardPlaceholder title="Analyze Image" /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><DashboardPlaceholder title="My Reports" /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><DashboardPlaceholder title="Appointments" /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><DashboardPlaceholder title="AI Insights" /></ProtectedRoute>} />
      <Route path="/knowledge" element={<ProtectedRoute><DashboardPlaceholder title="Knowledge Hub" /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardPlaceholder title="Settings" /></ProtectedRoute>} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
