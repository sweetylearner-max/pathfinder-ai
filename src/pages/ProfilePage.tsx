// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Paper, Stack, TextField, Button, Avatar,
  Alert, Divider
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import { useUser } from '../hooks/useConnectDB'


export default function ProfilePage({ userId }: { userId: number }) {
  const { user, updateUser } = useUser(userId)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '', bio: '', email: '', phone: '', avatar: ''
  })

  useEffect(() => {
    if (user) setForm({
      name: user.name ?? '',
      bio: user.bio ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      avatar: user.avatar ?? ''
    })
  }, [user])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, avatar: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    await updateUser(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Profile Settings</Typography>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Profile saved successfully!</Alert>}

      <Paper sx={{ p: 3 }}>
        {/* Avatar */}
        <Stack alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={form.avatar}
              sx={{
                width: 96, height: 96,
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                fontSize: '2.5rem',
                border: '3px solid rgba(124,58,237,0.4)'
              }}
            >
              {form.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            {editing && (
              <>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                <Box
                  onClick={() => fileRef.current?.click()}
                  sx={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', opacity: 0, '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s'
                  }}
                >
                  <PhotoCameraIcon sx={{ color: 'white' }} />
                </Box>
              </>
            )}
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>{user?.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2.5}>
          <TextField
            label="Display Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            disabled={!editing}
            fullWidth
          />
          <TextField
            label="Bio"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            disabled={!editing}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            disabled={!editing}
            fullWidth
            type="email"
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            disabled={!editing}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          {!editing ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={() => { setEditing(false); if (user) setForm({ name: user.name, bio: user.bio, email: user.email ?? '', phone: user.phone ?? '', avatar: user.avatar ?? '' }) }}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </Stack>
      </Paper>

      {/* Storage Info */}
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Storage Info</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          All your data is stored locally in your browser's IndexedDB. No data is sent to any server.
          This app works completely offline. 🔒
        </Typography>
        <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Typography variant="body2" sx={{ color: '#34D399' }}>
            ✓ 100% Offline — No internet required<br />
            ✓ All data in IndexedDB (Dexie.js)<br />
            ✓ PWA installable on mobile<br />
            ✓ No account or login needed
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
