// src/pages/AnalyticsPage.tsx
import React from 'react'
import {
  Box, Typography, Paper, Grid, Chip, Stack
} from '@mui/material'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts'
import { useAnalytics, usePublicPages } from '../hooks/useConnectDB'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import QrCode2Icon from '@mui/icons-material/QrCode2'


const CHART_COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']
const tooltipStyle = {
  contentStyle: { background: '#1A1A35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 },
  labelStyle: { color: '#F1F0FF' }
}

export default function AnalyticsPage({ userId }: { userId: number }) {
  const { totalScans, scansByPage, scansByDay, recentEvents } = useAnalytics(userId)
  const { pages } = usePublicPages(userId)

  const topPages = [...scansByPage].sort((a, b) => b.scans - a.scans).slice(0, 5)

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Analytics</Typography>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Scans', value: totalScans, icon: <VisibilityIcon />, color: '#7C3AED' },
          { label: 'Active QR Pages', value: pages.length, icon: <QrCode2Icon />, color: '#06B6D4' },
          {
            label: 'Avg Scans/Page',
            value: pages.length ? (totalScans / pages.length).toFixed(1) : 0,
            icon: <TrendingUpIcon />,
            color: '#10B981'
          }
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Paper sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                  background: `${s.color}22`, border: `1px solid ${s.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color
                }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{s.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Scans over time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Daily Scans — Last 7 Days</Typography>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scansByDay}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#A0A0C0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#A0A0C0' }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="scans" stroke="#7C3AED" strokeWidth={2.5} fill="url(#grad1)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Scans by Page</Typography>
            {topPages.length > 0 ? (
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topPages}
                      dataKey="scans"
                      nameKey="title"
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                    >
                      {topPages.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(v: any) => [`${v} scans`]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No scan data yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Bar chart by page */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Scans per QR Page</Typography>
            {scansByPage.length > 0 ? (
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scansByPage} margin={{ left: 0, right: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#A0A0C0' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#A0A0C0' }} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="scans" fill="#7C3AED" radius={[4, 4, 0, 0]}>
                      {scansByPage.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Generate QR codes and share them to see analytics here.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Recent Events</Typography>
            {recentEvents.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No events yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {recentEvents.map((ev, i) => (
                  <Box key={i} sx={{
                    display: 'flex', alignItems: 'center', gap: 2, p: 1.5,
                    borderRadius: 1.5, background: 'rgba(255,255,255,0.03)'
                  }}>
                    <Chip
                      label={ev.eventType}
                      size="small"
                      sx={{
                        background: ev.eventType === 'scan' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)',
                        color: ev.eventType === 'scan' ? '#34D399' : '#A78BFA',
                        border: `1px solid ${ev.eventType === 'scan' ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.3)'}`
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                      /p/{ev.pageUuid.slice(0, 8)}...
                    </Typography>
                    <Box flex={1} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {new Date(ev.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
