// src/components/QRStyler.tsx
import React, { useState, useRef, useCallback } from 'react'
import {
  Box, Typography, Slider, Button, Stack, Paper,
  IconButton, Tooltip, Divider, TextField, Chip
} from '@mui/material'
import { QRCodeCanvas } from 'qrcode.react'
import DownloadIcon from '@mui/icons-material/Download'
import ImageIcon from '@mui/icons-material/Image'
import DeleteIcon from '@mui/icons-material/Delete'
import QrCode2Icon from '@mui/icons-material/QrCode2'

interface QRSettings {
  fgColor: string
  bgColor: string
  logoDataUrl?: string
  size: number
}

interface QRStylerProps {
  url: string
  settings: QRSettings
  onChange: (settings: QRSettings) => void
  title?: string
}

const PRESET_COLORS = [
  { fg: '#7C3AED', bg: '#0F0F23', label: 'Purple Dark' },
  { fg: '#06B6D4', bg: '#0F1A2A', label: 'Cyan Night' },
  { fg: '#10B981', bg: '#0A1F0F', label: 'Emerald' },
  { fg: '#F59E0B', bg: '#1A1000', label: 'Gold' },
  { fg: '#EF4444', bg: '#1A0000', label: 'Red' },
  { fg: '#000000', bg: '#FFFFFF', label: 'Classic' },
  { fg: '#FFFFFF', bg: '#000000', label: 'Inverted' },
]

export default function QRStyler({ url, settings, onChange, title }: QRStylerProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<QRSettings>) => onChange({ ...settings, ...patch })

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => update({ logoDataUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  const downloadQR = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${title ?? 'code'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [title])

  return (
    <Box>
      {/* QR Preview */}
      <Paper sx={{ p: 3, textAlign: 'center', mb: 3, position: 'relative' }}>
        <Box
          ref={canvasRef}
          sx={{
            display: 'inline-block',
            p: 2,
            borderRadius: 2,
            background: settings.bgColor,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          <QRCodeCanvas
            value={url || 'https://example.com'}
            size={settings.size}
            fgColor={settings.fgColor}
            bgColor={settings.bgColor}
            level="H"
            includeMargin
            imageSettings={settings.logoDataUrl ? {
              src: settings.logoDataUrl,
              width: Math.round(settings.size * 0.2),
              height: Math.round(settings.size * 0.2),
              excavate: true
            } : undefined}
          />
        </Box>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          {url}
        </Typography>
      </Paper>

      {/* Controls */}
      <Stack spacing={2.5}>
        {/* Size */}
        <Box>
          <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
            QR Size: {settings.size}px
          </Typography>
          <Slider
            value={settings.size}
            onChange={(_, v) => update({ size: v as number })}
            min={128} max={512} step={32}
            marks
            size="small"
            sx={{ color: 'primary.main' }}
          />
        </Box>

        <Divider />

        {/* Color Presets */}
        <Box>
          <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
            Color Presets
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {PRESET_COLORS.map(p => (
              <Tooltip key={p.label} title={p.label}>
                <Box
                  onClick={() => update({ fgColor: p.fg, bgColor: p.bg })}
                  sx={{
                    width: 36, height: 36, borderRadius: 1, cursor: 'pointer',
                    background: `linear-gradient(135deg, ${p.bg} 50%, ${p.fg} 50%)`,
                    border: settings.fgColor === p.fg ? '2px solid #7C3AED' : '2px solid transparent',
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'all 0.2s'
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>

        {/* Custom Colors */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>QR Color</Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <input
                type="color"
                value={settings.fgColor}
                onChange={e => update({ fgColor: e.target.value })}
                style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
              />
              <TextField
                size="small"
                value={settings.fgColor}
                onChange={e => update({ fgColor: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>
          <Box flex={1}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Background</Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <input
                type="color"
                value={settings.bgColor}
                onChange={e => update({ bgColor: e.target.value })}
                style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }}
              />
              <TextField
                size="small"
                value={settings.bgColor}
                onChange={e => update({ bgColor: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>
        </Stack>

        <Divider />

        {/* Logo */}
        <Box>
          <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
            Center Logo (optional)
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              size="small"
              onClick={() => fileRef.current?.click()}
            >
              Upload Logo
            </Button>
            {settings.logoDataUrl && (
              <>
                <Box
                  component="img"
                  src={settings.logoDataUrl}
                  sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover' }}
                />
                <IconButton size="small" onClick={() => update({ logoDataUrl: undefined })}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Download */}
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={downloadQR}
          fullWidth
          size="large"
        >
          Download QR Code (PNG)
        </Button>
      </Stack>
    </Box>
  )
}
