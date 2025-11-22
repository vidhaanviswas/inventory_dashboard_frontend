import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoadingScreen from './pages/LoadingScreen';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OverviewPage from './pages/OverviewPage';
import SettingsPage from './pages/SettingsPage';

// NEW PAGES
import SkuManagementPage from './pages/SkuManagementPage';
import InventoryPage from './pages/InventoryPage';
import TransactionsPage from './pages/TransactionsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WarehousePage from './pages/WarehousePage';


function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoadingScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          >
            {/* /dashboard (main dashboard) */}
            <Route index element={<OverviewPage />} />

            {/* /dashboard/sku */}
            <Route path="sku" element={<SkuManagementPage />} />

            {/* /dashboard/inventory */}
            <Route path="inventory" element={<InventoryPage />} />

            {/* /dashboard/transactions */}
            <Route path="transactions" element={<TransactionsPage />} />

            {/* /dashboard/purchase */}
            <Route path="purchase" element={<PurchaseOrdersPage />} />

            {/* /dashboard/analytics */}
            <Route path="analytics" element={<AnalyticsPage />} />

            {/* /dashboard/warehouse */}
            <Route path="warehouse" element={<WarehousePage />} />

            {/* /dashboard/settings */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
