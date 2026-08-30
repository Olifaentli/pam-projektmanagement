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
      {/* Die Kopfleiste ist hell und flach; die Orientierung uebernimmt die
          dunkle Seitenleiste. Sie liegt deshalb NICHT mehr ueber dem Drawer. */}
      <AppBar
        position="fixed"
        color="inherit"
        sx={{ width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` } }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}
          >
            Projekt- und Aufgabenmanagement
          </Typography>
          {user && (
            // color="primary" statt "inherit": auf weissem Grund waere der
            // Knopf sonst unsichtbar.
            <Button color="primary" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Abmelden
            </Button>
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
        {/* Markenblock ersetzt den bisherigen leeren Toolbar-Abstand. */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, px: 2.5, height: 64 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: 'secondary.main',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            p
          </Box>
          <Typography
            sx={{
              color: '#fff',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            pam
          </Typography>
        </Box>
        <Box sx={{ overflow: 'auto' }}>
          <List component="nav" aria-label="Hauptnavigation">
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                // Eine Unterseite markiert den übergeordneten Eintrag mit:
                // /projects/7 soll "Projekte" hervorheben, nicht gar nichts.
                selected={
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path)
                }
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {/* Der Administrationsbereich erscheint nur fuer die Rolle ADMIN. */}
            <RoleGate roles={['ADMIN']}>
              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,.14)' }} />
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

        {/* Der angemeldete Benutzer steht am Fuss der Navigationsschiene. */}
        {user && (
          <Box
            sx={{
              mt: 'auto',
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.4,
              borderTop: '1px solid rgba(255,255,255,.14)',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 13 }}>
              {user.fullName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 600 }} noWrap>
                {user.fullName}
              </Typography>
              <Typography sx={{ color: '#9FB3C8', fontSize: 11 }} noWrap>
                {user.roles.map((r) => ROLE_LABELS[r]).join(', ')}
              </Typography>
            </Box>
          </Box>
        )}
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
