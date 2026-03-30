// src/pages/CategoriesPage.tsx
import React, { useState } from 'react'
import {
  Box, Typography, Paper, Stack, Button, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Accordion, AccordionSummary, AccordionDetails,
  Switch, FormControlLabel, Alert, Tooltip, Fab
} from '@mui/material'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinkIcon from '@mui/icons-material/Link'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useCategories, useItems } from '../hooks/useConnectDB'
import type { Category, Item, ItemType } from '../db/db'

const ITEM_TYPES: { value: ItemType; label: string; icon: React.ReactNode }[] = [
  { value: 'url',   label: 'URL / Link',   icon: <LinkIcon /> },
  { value: 'text',  label: 'Text / Bio',   icon: <TextFieldsIcon /> },
  { value: 'video', label: 'Video',        icon: <VideoLibraryIcon /> },
  { value: 'music', label: 'Music',        icon: <AudiotrackIcon /> },
  { value: 'file',  label: 'File / Image', icon: <InsertDriveFileIcon /> },
]

const EMOJI_OPTIONS = ['🔗', '💼', '🎵', '📷', '📚', '🎯', '💡', '🌐', '📱', '🎨']
const COLOR_OPTIONS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6']

// ─── Item Form ────────────────────────────────────────────────────────────────

function ItemForm({
  categoryId, userId, item, onClose
}: {
  categoryId: number; userId: number; item?: Item; onClose: () => void
}) {
  const { addItem, updateItem } = useItems(categoryId)
  const [form, setForm] = useState({
    title:       item?.title ?? '',
    type:        item?.type ?? 'url' as ItemType,
    value:       item?.value ?? '',
    description: item?.description ?? '',
    isActive:    item?.isActive ?? true,
    userId
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, value: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.value.trim()) { setError('Value/content is required'); return }

    setLoading(true)
    let err: string | null = null
    if (item?.id) {
      err = await updateItem(item.id, form)
    } else {
      err = await addItem(form)
    }
    setLoading(false)

    if (err) { setError(err); return }
    onClose()
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Title"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        fullWidth size="small"
      />
      <TextField
        select label="Type"
        value={form.type}
        onChange={e => setForm(f => ({ ...f, type: e.target.value as ItemType, value: '' }))}
        fullWidth size="small"
      >
        {ITEM_TYPES.map(t => (
          <MenuItem key={t.value} value={t.value}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {t.icon}<span>{t.label}</span>
            </Stack>
          </MenuItem>
        ))}
      </TextField>

      {/* Dynamic value input by type */}
      {form.type === 'url' && (
        <TextField label="URL" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} fullWidth size="small" placeholder="https://" />
      )}
      {form.type === 'text' && (
        <TextField label="Text / Bio" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} fullWidth multiline rows={3} size="small" />
      )}
      {(form.type === 'video') && (
        <TextField label="Video URL (YouTube, Vimeo, etc)" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} fullWidth size="small" />
      )}
      {(form.type === 'music') && (
        <TextField label="Music URL (Spotify, SoundCloud, etc)" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} fullWidth size="small" />
      )}
      {form.type === 'file' && (
        <Box>
          <input type="file" id="file-upload" hidden onChange={handleFile} />
          <label htmlFor="file-upload">
            <Button variant="outlined" component="span" fullWidth>
              {form.value ? '✓ File loaded (base64)' : 'Upload File / Image'}
            </Button>
          </label>
          {form.value && form.value.startsWith('data:image') && (
            <Box component="img" src={form.value} sx={{ mt: 1, width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 1 }} />
          )}
        </Box>
      )}

      <TextField
        label="Description (optional)"
        value={form.description}
        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        fullWidth size="small"
      />
      <FormControlLabel
        control={<Switch checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />}
        label="Active (visible in public profile)"
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {item ? 'Update' : 'Add Item'}
        </Button>
      </Stack>
    </Stack>
  )
}

// ─── Item List with DnD ───────────────────────────────────────────────────────

function CategoryItems({ category, userId }: { category: Category; userId: number }) {
  const { items, deleteItem, reorderItems, toggleItem } = useItems(category.id!)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(items)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    reorderItems(reordered)
  }

  return (
    <Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`cat-${category.id}`}>
          {provided => (
            <Stack ref={provided.innerRef} {...provided.droppableProps} spacing={1}>
              {items.map((item, idx) => (
                <Draggable key={item.id!} draggableId={`item-${item.id}`} index={idx}>
                  {(drag, snap) => (
                    <Paper
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      sx={{
                        p: 1.5,
                        display: 'flex', alignItems: 'center', gap: 1,
                        opacity: item.isActive ? 1 : 0.5,
                        background: snap.isDragging ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                        border: snap.isDragging ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Box {...drag.dragHandleProps} sx={{ color: 'text.secondary', cursor: 'grab', display: 'flex' }}>
                        <DragIndicatorIcon fontSize="small" />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                          <Chip label={item.type} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Stack>
                        {item.description && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{item.description}</Typography>
                        )}
                      </Box>
                      <Switch
                        checked={item.isActive}
                        onChange={e => toggleItem(item.id!, e.target.checked)}
                        size="small"
                      />
                      <IconButton size="small" onClick={() => setEditItem(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteItem(item.id!)} sx={{ color: 'error.light' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        startIcon={<AddIcon />}
        size="small"
        sx={{ mt: 1.5 }}
        onClick={() => setAddOpen(true)}
      >
        Add Item
      </Button>

      {/* Add/Edit dialogs */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Item to "{category.name}"</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <ItemForm categoryId={category.id!} userId={userId} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editItem && (
            <ItemForm
              categoryId={category.id!}
              userId={userId}
              item={editItem}
              onClose={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────


export default function CategoriesPage({ userId }: { userId: number }) {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useCategories(userId)
  const [addOpen, setAddOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', icon: '🔗', color: '#7C3AED' })

  const handleAddCategory = async () => {
    if (!form.name.trim()) return
    await addCategory(form)
    setForm({ name: '', icon: '🔗', color: '#7C3AED' })
    setAddOpen(false)
  }

  const handleEditCategory = async () => {
    if (!editCat?.id || !form.name.trim()) return
    await updateCategory(editCat.id, form)
    setEditCat(null)
  }

  const handleCatDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(categories)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    reorderCategories(reordered)
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          New Category
        </Button>
      </Stack>

      <DragDropContext onDragEnd={handleCatDragEnd}>
        <Droppable droppableId="categories">
          {provided => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {categories.map((cat, idx) => (
                <Draggable key={cat.id!} draggableId={`cat-${cat.id}`} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps} sx={{ mb: 2 }}>
                      <Accordion
                        sx={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          '&:before': { display: 'none' }
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                            <Box {...drag.dragHandleProps} sx={{ color: 'text.secondary', display: 'flex', cursor: 'grab' }}>
                              <DragIndicatorIcon />
                            </Box>
                            <Box sx={{
                              width: 36, height: 36, borderRadius: 1.5,
                              background: `${cat.color}22`,
                              border: `1px solid ${cat.color}44`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.2rem'
                            }}>
                              {cat.icon ?? '📁'}
                            </Box>
                            <Typography fontWeight={600}>{cat.name}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 1 }}>
                            <IconButton
                              size="small"
                              onClick={e => { e.stopPropagation(); setForm({ name: cat.name, icon: cat.icon ?? '🔗', color: cat.color ?? '#7C3AED' }); setEditCat(cat) }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={e => { e.stopPropagation(); deleteCategory(cat.id!) }}
                              sx={{ color: 'error.light' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <CategoryItems category={cat} userId={userId} />
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {categories.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 2 }}>📂</Typography>
          <Typography variant="h6" gutterBottom>No categories yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Create a category to start organizing your links and content.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Create First Category
          </Button>
        </Paper>
      )}

      {/* Add Category Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" autoFocus />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Icon</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: '4px' }}>
                {EMOJI_OPTIONS.map(e => (
                  <Box
                    key={e}
                    onClick={() => setForm(f => ({ ...f, icon: e }))}
                    sx={{
                      width: 36, height: 36, borderRadius: 1, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem',
                      background: form.icon === e ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                      border: form.icon === e ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
                    }}
                  >
                    {e}
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Color</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                {COLOR_OPTIONS.map(c => (
                  <Box
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    sx={{
                      width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', background: c,
                      border: form.color === c ? '3px solid white' : '3px solid transparent',
                      transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCategory}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editCat} onClose={() => setEditCat(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Category Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth size="small" />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Icon</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: '4px' }}>
                {EMOJI_OPTIONS.map(e => (
                  <Box key={e} onClick={() => setForm(f => ({ ...f, icon: e }))} sx={{ width: 36, height: 36, borderRadius: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: form.icon === e ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)', border: form.icon === e ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent' }}>
                    {e}
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Color</Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                {COLOR_OPTIONS.map(c => (
                  <Box key={c} onClick={() => setForm(f => ({ ...f, color: c }))} sx={{ width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent' }} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCat(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditCategory}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
