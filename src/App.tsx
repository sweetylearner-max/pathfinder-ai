// src/App.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Toolbar, AppBar, useTheme, useMediaQuery,
  Avatar, Divider, Chip, Fab, Tooltip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import CategoryIcon from '@mui/icons-material/Category'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import BarChartIcon from '@mui/icons-material/BarChart'
import PersonIcon from '@mui/icons-material/Person'
import NfcIcon from '@mui/icons-material/Nfc'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { darkTheme, lightTheme } from './theme/theme'
import { db, ensureDefaultUser } from './db/db'
import { useUser } from './hooks/useConnectDB'

// Pages
import DashboardPage from './pages/DashboardPage'
import CategoriesPage from './pages/CategoriesPage'
import MyQRsPage from './pages/MyQRsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import PublicView from './pages/PublicView'

const DRAWER_WIDTH = 260

const NAV_ITEMS = [
  { path: '/',           icon: <HomeIcon />,     label: 'Home' },
  { path: '/categories', icon: <CategoryIcon />, label: 'Categories' },
  { path: '/qrs',        icon: <QrCode2Icon />,  label: 'My QRs' },
  { path: '/analytics',  icon: <BarChartIcon />, label: 'Analytics' },
  { path: '/profile',    icon: <PersonIcon />,   label: 'Profile' },
]

function Sidebar({ userId, onClose }: { userId: number; onClose?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser(userId)

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <QrCode2Icon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              Connect HUB
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.light' }}>Pro</Typography>
          </Box>
        </Stack>
      </Box>

      {/* User Card */}
      {user && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{
            p: 1.5, borderRadius: 2,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', gap: 1.5
          }}>
            <Avatar
              src={user.avatar}
              sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', fontSize: '1rem' }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            <Box minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>{user.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {user.email || 'No email set'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav */}
      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => { navigate(item.path); onClose?.() }}
              sx={{ mb: 0.5 }}
            >
              <ListItemIcon sx={{ color: active ? 'primary.light' : 'text.secondary', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2', fontWeight: active ? 600 : 400 }}
              />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ mx: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* NFC Button */}
      <Box sx={{ p: 2 }}>
        <Tooltip title="NFC Write — Opens Web NFC API on compatible devices">
          <Chip
            icon={<NfcIcon />}
            label="Write to NFC"
            onClick={() => {
              // Web NFC API simulation
              if ('NDEFReader' in window) {
                alert('Web NFC API detected! Scanning...')
              } else {
                alert('Web NFC simulation: Would write current profile URL to NFC tag.\n(Web NFC API requires Chrome on Android)')
              }
            }}
            sx={{
              width: '100%', cursor: 'pointer', justifyContent: 'flex-start',
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
              color: '#67E8F9', '&:hover': { background: 'rgba(6,182,212,0.2)' }
            }}
          />
        </Tooltip>
      </Box>
    </Box>
  )
}

// Stack component (not exported from MUI by default in older versions)
function Stack({ direction = 'column', alignItems, spacing = 0, children, ...rest }: any) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        alignItems,
        gap: spacing * 8 + 'px',
        ...rest.sx
      }}
    >
      {children}
    </Box>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const theme = isDark ? darkTheme : lightTheme
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    ensureDefaultUser().then(setUserId)
  }, [])

  if (!userId) return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F0F23, #1A0F35)'
      }}>
        <Typography variant="h6" sx={{ color: 'white', opacity: 0.7 }}>
          Loading Connect HUB Pro...
        </Typography>
      </Box>
    </ThemeProvider>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public route - no sidebar */}
        <Route path="/p/:uuid" element={<PublicView />} />

        {/* App routes */}
        <Route path="/*" element={
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Desktop Drawer */}
            {!isMobile && (
              <Drawer
                variant="permanent"
                sx={{
                  width: DRAWER_WIDTH,
                  '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' }
                }}
              >
                <Sidebar userId={userId} />
              </Drawer>
            )}

            {/* Mobile Drawer */}
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { width: DRAWER_WIDTH }
              }}
            >
              <Sidebar userId={userId} onClose={() => setMobileOpen(false)} />
            </Drawer>

            {/* Main */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Mobile AppBar */}
              {isMobile && (
                <AppBar position="sticky" elevation={0} sx={{
                  background: 'rgba(15,15,35,0.9)',
                  backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <Toolbar>
                    <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: 'white', mr: 1 }}>
                      <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>Connect HUB Pro</Typography>
                    <IconButton onClick={() => setIsDark(!isDark)} sx={{ color: 'white' }}>
                      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                  </Toolbar>
                </AppBar>
              )}

              {/* Desktop Theme Toggle */}
              {!isMobile && (
                <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1200 }}>
                  <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
                    <IconButton onClick={() => setIsDark(!isDark)} sx={{
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'text.primary',
                      '&:hover': { background: 'rgba(255,255,255,0.12)' }
                    }}>
                      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Page Content */}
              <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
                <Routes>
                  <Route path="/"           element={<DashboardPage userId={userId} />} />
                  <Route path="/categories" element={<CategoriesPage userId={userId} />} />
                  <Route path="/qrs"        element={<MyQRsPage userId={userId} />} />
                  <Route path="/analytics"  element={<AnalyticsPage userId={userId} />} />
                  <Route path="/profile"    element={<ProfilePage userId={userId} />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        } />
      </Routes>
    </ThemeProvider>
  )
}
