import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes/routes";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {routes.map((route, idx) => {
            const element = <route.page showHeader={route.isShowHeader} />;

            if (route.requiredPermissions === 0) {
              // Public routes
              return <Route key={idx} path={route.path} element={element} />;
            } else if (route.requiredPermissions === 1) {
              // Authenticated user routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={<ProtectedRoute>{element}</ProtectedRoute>}
                />
              );
            } else if (route.requiredPermissions === 2) {
              // Admin-only routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              );
            } else if (route.requiredPermissions === 3) {
              // TeamLeader-only routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    <ProtectedRoute requireTeamLeader={true}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              );
            } else if (route.requiredPermissions === 3) {
              // TeamLeader-only routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    <ProtectedRoute requireTeamLeader={true}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              );
            } else if (route.requiredPermissions === 4) {
              // Technician-only routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    <ProtectedRoute requireTechnician={true}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              );
            } else if (route.requiredPermissions === 5) {
              // TechnicianManager-only routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    <ProtectedRoute requireTechnicianManager={true}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              );
            } else if (route.requiredPermissions === 6) {
              // Manager-only routes
              return (
                <Route
                  key={idx}
                  path={route.path}
                  element={
                    <ProtectedRoute requireManager={true}>
                      {element}
                    </ProtectedRoute>
                  }
                />
              );
            }
            return null;
          })}
          {/* Show NotFoundPage for unmatched routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
