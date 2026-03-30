// src/pages/PublicView.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, Avatar, Chip, Stack, Paper, IconButton,
  Container, Divider, CircularProgress, Fade, Tooltip
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { getPublicPageByUUID, logScan } from '../hooks/useConnectDB'
import type { PublicPage, Item, Category } from '../db/db'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  url:   <LinkIcon fontSize="small" />,
  text:  <TextFieldsIcon fontSize="small" />,
  file:  <InsertDriveFileIcon fontSize="small" />,
  video: <VideoLibraryIcon fontSize="small" />,
  music: <AudiotrackIcon fontSize="small" />
}

function ItemCard({ item }: { item: Item }) {
  const isUrl = item.type === 'url'
  return (
    <Fade in timeout={600}>
      <Paper
        component={isUrl ? 'a' : 'div'}
        href={isUrl ? item.value : undefined}
        target={isUrl ? '_blank' : undefined}
        rel={isUrl ? 'noopener noreferrer' : undefined}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          textDecoration: 'none',
          color: 'inherit',
          cursor: isUrl ? 'pointer' : 'default',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': isUrl ? {
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(124,58,237,0.2)'
          } : {}
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.2) 100%)',
            border: '1px solid rgba(124,58,237,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#A78BFA', flexShrink: 0
          }}
        >
          {TYPE_ICONS[item.type]}
        </Box>

        {/* Content */}
        <Box flex={1} minWidth={0}>
          <Typography variant="body1" fontWeight={600} noWrap>{item.title}</Typography>
          {item.description && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {item.description}
            </Typography>
          )}
          {item.type === 'text' && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {item.value}
            </Typography>
          )}
        </Box>

        {isUrl && (
          <OpenInNewIcon sx={{ color: 'text.secondary', opacity: 0.6, flexShrink: 0 }} />
        )}
      </Paper>
    </Fade>
  )
}

export default function PublicView() {
  const { uuid } = useParams<{ uuid: string }>()
  const [page, setPage] = useState<PublicPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!uuid) return
    async function load() {
      const p = await getPublicPageByUUID(uuid!)
      if (!p) { setNotFound(true); setLoading(false); return }
      setPage(p)
      setLoading(false)
      // Log the scan/view
      await logScan(uuid!)
    }
    load()
  }, [uuid])

  if (loading) return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A0F35 50%, #0F1A35 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <CircularProgress sx={{ color: '#7C3AED' }} />
    </Box>
  )

  if (notFound) return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A0F35 50%, #0F1A35 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2
    }}>
      <Typography variant="h4" sx={{ color: 'white' }}>😕</Typography>
      <Typography variant="h6" sx={{ color: 'white' }}>Profile not found</Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
        This profile link may have been removed or does not exist.
      </Typography>
    </Box>
  )

  if (!page) return null

  const { snapshot } = page
  const { user, categories, items } = snapshot

  // Group items by category
  const itemsByCategory = categories.reduce<Record<number, Item[]>>((acc, cat) => {
    acc[cat.id] = items.filter(i => i.categoryId === cat.id && i.isActive)
    return acc
  }, {})

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A0F35 60%, #0F1A35 100%)',
      color: 'white',
      pb: 6
    }}>
      {/* Hero Header */}
      <Box sx={{
        pt: 6, pb: 4, textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Container maxWidth="sm">
          {/* Avatar */}
          <Box sx={{ mb: 3 }}>
            <Avatar
              src={user.avatar}
              sx={{
                width: 100, height: 100, mx: 'auto',
                border: '3px solid rgba(124,58,237,0.5)',
                boxShadow: '0 0 30px rgba(124,58,237,0.3)',
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                fontSize: '2.5rem'
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Box>

          <Typography variant="h4" fontWeight={700} gutterBottom sx={{
            background: 'linear-gradient(135deg, #F1F0FF, #A78BFA)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {page.title}
          </Typography>

          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            {page.description || user.bio}
          </Typography>

          {(user.email || user.phone) && (
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {user.email && <Chip label={user.email} size="small" sx={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }} />}
              {user.phone && <Chip label={user.phone} size="small" sx={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }} />}
            </Stack>
          )}
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {categories.map(cat => {
          const catItems = itemsByCategory[cat.id] ?? []
          if (catItems.length === 0) return null
          return (
            <Box key={cat.id} sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                {cat.icon && <Typography>{cat.icon}</Typography>}
                <Typography variant="h6" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  {cat.name}
                </Typography>
                <Chip
                  label={catItems.length}
                  size="small"
                  sx={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)', height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
              <Stack spacing={1.5}>
                {catItems.map(item => <ItemCard key={item.id} item={item} />)}
              </Stack>
            </Box>
          )
        })}

        {/* Footer */}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 4 }} />
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', display: 'block', textAlign: 'center' }}>
          Powered by Connect HUB Pro
        </Typography>
      </Container>
    </Box>
  )
}
