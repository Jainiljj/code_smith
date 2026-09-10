import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TendersPage } from './pages/TendersPage';
import { ComplianceMatrixPage } from './pages/ComplianceMatrixPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SellersPage } from './pages/SellersPage';
import { SellerDetailPage } from './pages/SellerDetailPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Business Application Shell */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/tenders" element={<TendersPage />} />
                    <Route path="/compliance" element={<ComplianceMatrixPage />} />
                    
                    {/* Phase 2.5 Seller Verification Routes */}
                    <Route path="/sellers" element={<SellersPage />} />
                    <Route path="/sellers/:sellerId" element={<SellerDetailPage />} />

                    {/* RBAC Role Protected Routes */}
                    <Route
                      path="/reviews"
                      element={
                        <ProtectedRoute requiredPermission="reviews:write">
                          <ReviewsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route
                      path="/audit"
                      element={
                        <ProtectedRoute requiredPermission="audit:read">
                          <AuditLogPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
