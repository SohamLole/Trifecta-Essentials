import { GoogleOAuthProvider } from "@react-oauth/google";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./components/AuthProvider.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ProviderShell = ({ children }) =>
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
  ) : (
    children
  );

const App = () => (
  <ToastProvider>
    <ProviderShell>
      <AuthProvider>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <UploadPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/screenshots/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ProviderShell>
  </ToastProvider>
);

export default App;
