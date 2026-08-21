import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import GroupIcon from '@mui/icons-material/Group'
import LogoutIcon from '@mui/icons-material/Logout'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { RoleGate } from '../auth/RoleGate'
import { ROLE_LABELS } from '../api/types'

const DRAWER_WIDTH = 248

/**
 * Rahmen aller angemeldeten Seiten: Kopfleiste mit Abmeldung und dauerhaft
 * sichtbare Seitennavigation. Die Navigation bleibt beim Seitenwechsel
 * stehen - nur der Inhaltsbereich wird ausgetauscht.
 */
export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { label: 'Übersicht', path: '/', icon: <DashboardIcon /> },
    { label: 'Projekte', path: '/projects', icon: <FolderIcon /> },
  ]

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Projekt- und Aufgabenmanagement
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
                {user.fullName
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2">{user.fullName}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {user.roles.map((r) => ROLE_LABELS[r]).join(', ')}
                </Typography>
              </Box>
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Abmelden
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List component="nav" aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {/* Der Administrationsbereich erscheint nur fuer die Rolle ADMIN. */}
            <RoleGate roles={['ADMIN']}>
              <Divider sx={{ my: 1 }} />
              <ListItemButton
                selected={location.pathname === '/admin/users'}
                onClick={() => navigate('/admin/users')}
              >
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary="Benutzerverwaltung" />
              </ListItemButton>
            </RoleGate>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar />
        <Container maxWidth="xl" disableGutters>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
