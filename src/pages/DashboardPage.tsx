// src/pages/DashboardPage.tsx
import React from 'react'
import {
  Box, Typography, Grid, Paper, Stack, Chip, Avatar,
  LinearProgress, Button
} from '@mui/material'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import CategoryIcon from '@mui/icons-material/Category'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LinkIcon from '@mui/icons-material/Link'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { useCategories, usePublicPages, useAnalytics, useUser } from '../hooks/useConnectDB'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({
  icon, label, value, color, sub
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  sub?: string
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
          {sub && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{sub}</Typography>}
        </Box>
      </Stack>
    </Paper>
  )
}

export default function DashboardPage({ userId }: { userId: number }) {
  const navigate = useNavigate()
  const { user } = useUser(userId)
  const { categories } = useCategories(userId)
  const { pages } = usePublicPages(userId)
  const { totalScans, scansByDay } = useAnalytics(userId)

  const totalItems = categories.reduce((acc, _) => acc, 0)

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.name?.split(' ')[0] ?? 'User'} 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Your offline digital profile hub — all data stored locally on your device.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard icon={<CategoryIcon />} label="Categories" value={categories.length} color="#7C3AED" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<LinkIcon />} label="QR Pages" value={pages.length} color="#06B6D4" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<VisibilityIcon />} label="Total Scans" value={totalScans} color="#10B981" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon />}
            label="Today's Scans"
            value={scansByDay[scansByDay.length - 1]?.scans ?? 0}
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Scan Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Scans – Last 7 Days
            </Typography>
            <Box sx={{ height: 200, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scansByDay}>
                  <defs>
                    <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A0A0C0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#A0A0C0' }} />
                  <Tooltip
                    contentStyle={{ background: '#1A1A35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#F1F0FF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="url(#scanGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Quick Actions</Typography>
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/categories')}
                fullWidth
              >
                Add Category
              </Button>
              <Button
                variant="outlined"
                startIcon={<QrCode2Icon />}
                onClick={() => navigate('/qrs')}
                fullWidth
              >
                Generate QR
              </Button>
            </Stack>

            {/* Recent QRs */}
            {pages.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Recent QRs</Typography>
                <Stack spacing={1}>
                  {pages.slice(0, 3).map(p => (
                    <Box key={p.id} sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, p: 1,
                      borderRadius: 1.5, background: 'rgba(255,255,255,0.04)'
                    }}>
                      <QrCode2Icon sx={{ color: 'primary.light', fontSize: 18 }} />
                      <Box flex={1} minWidth={0}>
                        <Typography variant="caption" fontWeight={600} noWrap>{p.title}</Typography>
                        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                          {p.scanCount} scans
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

