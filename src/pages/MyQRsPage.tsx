// src/pages/MyQRsPage.tsx
import React, { useState } from 'react'
import {
  Box, Typography, Paper, Stack, Button, Grid, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, TextField, Chip, Tooltip,
  Divider, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import TuneIcon from '@mui/icons-material/Tune'
import { QRCodeCanvas } from 'qrcode.react'
import { usePublicPages, useCategories, useItems } from '../hooks/useConnectDB'
import type { PublicPage } from '../db/db'
import QRStyler from '../components/QRStyler'

// ─── Generate Dialog ───────────────────────────────────────────────────────────

function GenerateQRDialog({
  userId,
  open,
  onClose
}: {
  userId: number
  open: boolean
  onClose: () => void
}) {
  const { categories } = useCategories(userId)
  const { generateQR } = usePublicPages(userId)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [title, setTitle] = useState('My Profile')
  const [description, setDescription] = useState('')
  const [qrSettings, setQrSettings] = useState({
    fgColor: '#7C3AED', bgColor: '#0F0F23', size: 256
  })
  const [step, setStep] = useState<'select' | 'style'>('select')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <QrCode2Icon sx={{ color: 'primary.main' }} />
          <span>Generate QR Code</span>
          <Box flex={1} />
          <Stack direction="row" spacing={1}>
            <Chip label="1. Select Items" size="small" color={step === 'select' ? 'primary' : 'default'} onClick={() => setStep('select')} />
            <Chip label="2. Style QR" size="small" color={step === 'style' ? 'primary' : 'default'} onClick={() => setStep('style')} />
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {step === 'select' && (
          <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Stack spacing={2}>
              <TextField label="Page Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth size="small" />
              <TextField label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} fullWidth size="small" />
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: 'text.secondary' }}>
              Select items to include in this QR page:
            </Typography>

            {categories.map(cat => (
              <CategoryItemSelector
                key={cat.id}
                category={cat}
                selectedItems={selectedItems}
                onToggle={id => setSelectedItems(prev =>
                  prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                )}
              />
            ))}

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              {selectedItems.length} item(s) selected
            </Typography>
          </Box>
        )}

        {step === 'style' && (
          <QRStyler
            url={`${window.location.origin}/p/preview`}
            settings={qrSettings}
            onChange={setQrSettings}
            title={title}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step === 'select' && (
          <Button
            variant="outlined"
            onClick={() => {
              if (!title.trim()) { setError('Title is required'); return }
              if (selectedItems.length === 0) { setError('Select at least one item'); return }
              setError('')
              setStep('style')
            }}
          >
            Next: Style QR →
          </Button>
        )}
        {step === 'style' && (
          <Button
            variant="contained"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              const uuid = await generateQR(userId, selectedItems, qrSettings, title, description)
              setLoading(false)
              onClose()
            }}
          >
            🚀 Generate & Save QR
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

function CategoryItemSelector({
  category, selectedItems, onToggle
}: {
  category: any
  selectedItems: number[]
  onToggle: (id: number) => void
}) {
  const { items } = useItems(category.id)
  if (items.length === 0) return null

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
        {category.icon} {category.name}
      </Typography>
      <Stack spacing={0.5}>
        {items.map(item => (
          <FormControlLabel
            key={item.id}
            control={
              <Checkbox
                size="small"
                checked={selectedItems.includes(item.id!)}
                onChange={() => onToggle(item.id!)}
              />
            }
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span style={{ fontSize: 14 }}>{item.title}</span>
                <Chip label={item.type} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
              </Stack>
            }
          />
        ))}
      </Stack>
    </Box>
  )
}

// ─── QR Card ──────────────────────────────────────────────────────────────────

function QRCard({ page, onDelete }: { page: PublicPage; onDelete: () => void }) {
  const [styleOpen, setStyleOpen] = useState(false)
  const { updateQRSettings } = usePublicPages(0) // userId doesn't matter here
  const url = `${window.location.origin}/p/${page.uuid}`

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
  }

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={2}>
        {/* Mini QR */}
        <Box sx={{
          p: 1.5, borderRadius: 2, flexShrink: 0,
          background: page.qrSettings.bgColor,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <QRCodeCanvas
            value={url}
            size={80}
            fgColor={page.qrSettings.fgColor}
            bgColor={page.qrSettings.bgColor}
            level="H"
            imageSettings={page.qrSettings.logoDataUrl ? {
              src: page.qrSettings.logoDataUrl,
              width: 16, height: 16, excavate: true
            } : undefined}
          />
        </Box>

        {/* Info */}
        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>{page.title}</Typography>
          {page.description && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{page.description}</Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
            <Chip label={`${page.scanCount} scans`} size="small" sx={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)' }} />
            <Chip label={`${page.snapshot.items.length} items`} size="small" />
            <Chip label={page.createdAt.toLocaleDateString()} size="small" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', fontFamily: 'monospace' }} noWrap>
            /p/{page.uuid.slice(0, 12)}...
          </Typography>
        </Box>

        {/* Actions */}
        <Stack spacing={0.5}>
          <Tooltip title="Copy URL">
            <IconButton size="small" onClick={copyUrl}><ContentCopyIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Open Profile Page">
            <IconButton size="small" onClick={() => window.open(url, '_blank')}><OpenInNewIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Edit QR Style">
            <IconButton size="small" onClick={() => setStyleOpen(true)}><TuneIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={onDelete} sx={{ color: 'error.light' }}><DeleteIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* QR Style Dialog */}
      <Dialog open={styleOpen} onClose={() => setStyleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customize QR — {page.title}</DialogTitle>
        <DialogContent>
          <QRStyler
            url={url}
            settings={page.qrSettings}
            onChange={async s => {
              await updateQRSettings(page.id!, s)
            }}
            title={page.title}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStyleOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

// ─── Stack helper ─────────────────────────────────────────────────────────────


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyQRsPage({ userId }: { userId: number }) {
  const { pages, deletePage } = usePublicPages(userId)
  const [genOpen, setGenOpen] = useState(false)

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>My QR Codes</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGenOpen(true)}>
          Generate QR
        </Button>
      </Stack>

      {pages.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>📱</Typography>
          <Typography variant="h6" gutterBottom>No QR codes yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Generate your first QR code to share your profile.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGenOpen(true)}>
            Generate First QR
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {pages.map(page => (
            <QRCard key={page.id} page={page} onDelete={() => deletePage(page.id!)} />
          ))}
        </Stack>
      )}

      <GenerateQRDialog userId={userId} open={genOpen} onClose={() => setGenOpen(false)} />
    </Box>
  )
}
