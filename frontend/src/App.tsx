import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectListPage } from './pages/ProjectListPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { UserAdminPage } from './pages/UserAdminPage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * Seitenstruktur und Navigation der Anwendung.
 *
 * Alle angemeldeten Seiten liegen unter einer gemeinsamen Layout-Route: Die
 * Kopfleiste und die Seitennavigation bleiben beim Wechsel stehen, nur der
 * Inhalt wird ausgetauscht. Die Anmeldeseite steht bewusst ausserhalb dieses
 * Rahmens, weil dort noch keine Navigation sinnvoll ist.
 */
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <UserAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
