// src/hooks/useConnectDB.ts
import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { db, User, Category, Item, PublicPage, AnalyticsEvent, ItemType } from '../db/db'

// ─── User Hooks ───────────────────────────────────────────────────────────────

export function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const u = await db.users.get(userId)
    setUser(u ?? null)
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const updateUser = async (data: Partial<User>) => {
    await db.users.update(userId, { ...data, updatedAt: new Date() })
    await load()
  }

  return { user, loading, updateUser, refresh: load }
}

// ─── Category Hooks ───────────────────────────────────────────────────────────

export function useCategories(userId: number) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const cats = await db.categories
      .where('userId').equals(userId)
      .toArray()
    setCategories(cats.sort((a, b) => a.order - b.order))
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const addCategory = async (data: Omit<Category, 'id' | 'userId' | 'order' | 'createdAt' | 'updatedAt'>) => {
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), -1)
    await db.categories.add({
      ...data,
      userId,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    await load()
  }

  const updateCategory = async (id: number, data: Partial<Category>) => {
    await db.categories.update(id, { ...data, updatedAt: new Date() })
    await load()
  }

  const deleteCategory = async (id: number) => {
    await db.items.where('categoryId').equals(id).delete()
    await db.categories.delete(id)
    await load()
  }

  const reorderCategories = async (reordered: Category[]) => {
    const updates = reordered.map((c, i) =>
      db.categories.update(c.id!, { order: i, updatedAt: new Date() })
    )
    await Promise.all(updates)
    setCategories(reordered)
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory, reorderCategories, refresh: load }
}

// ─── Item Hooks ───────────────────────────────────────────────────────────────

export function useItems(categoryId: number) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const its = await db.items
      .where('categoryId').equals(categoryId)
      .toArray()
    setItems(its.sort((a, b) => a.order - b.order))
    setLoading(false)
  }, [categoryId])

  useEffect(() => { load() }, [load])

  // Duplicate detection
  const checkDuplicate = async (title: string, value: string, excludeId?: number): Promise<string | null> => {
    const existing = await db.items.where('categoryId').equals(categoryId).toArray()
    const filtered = excludeId ? existing.filter(i => i.id !== excludeId) : existing
    if (filtered.some(i => i.title.toLowerCase() === title.toLowerCase())) {
      return 'An item with this title already exists in this category.'
    }
    if (filtered.some(i => i.type === 'url' && i.value === value)) {
      return 'This URL already exists in this category.'
    }
    return null
  }

  const addItem = async (data: Omit<Item, 'id' | 'categoryId' | 'order' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    const dupError = await checkDuplicate(data.title, data.value)
    if (dupError) return dupError
    const maxOrder = items.reduce((m, i) => Math.max(m, i.order), -1)
    await db.items.add({
      ...data,
      categoryId,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    await load()
    return null
  }

  const updateItem = async (id: number, data: Partial<Item>): Promise<string | null> => {
    if (data.title || data.value) {
      const current = await db.items.get(id)
      const dupError = await checkDuplicate(
        data.title ?? current?.title ?? '',
        data.value ?? current?.value ?? '',
        id
      )
      if (dupError) return dupError
    }
    await db.items.update(id, { ...data, updatedAt: new Date() })
    await load()
    return null
  }

  const deleteItem = async (id: number) => {
    await db.items.delete(id)
    await load()
  }

  const reorderItems = async (reordered: Item[]) => {
    const updates = reordered.map((item, i) =>
      db.items.update(item.id!, { order: i, updatedAt: new Date() })
    )
    await Promise.all(updates)
    setItems(reordered)
  }

  const toggleItem = async (id: number, isActive: boolean) => {
    await db.items.update(id, { isActive, updatedAt: new Date() })
    await load()
  }

  return { items, loading, addItem, updateItem, deleteItem, reorderItems, toggleItem, refresh: load }
}

// ─── All Items for a User ─────────────────────────────────────────────────────

export function useAllUserItems(userId: number) {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    db.items.where('userId').equals(userId).toArray().then(setItems)
  }, [userId])

  return { items }
}

// ─── QR / PublicPage Hooks ────────────────────────────────────────────────────

export function usePublicPages(userId: number) {
  const [pages, setPages] = useState<PublicPage[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const p = await db.publicPages.where('userId').equals(userId).toArray()
    setPages(p.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  // The Snapshot Algorithm
  const generateQR = async (
    userId: number,
    selectedItemIds: number[],
    qrSettings: PublicPage['qrSettings'],
    title: string,
    description?: string
  ): Promise<string> => {
    const user = await db.users.get(userId)
    const allItems = await db.items.where('id').anyOf(selectedItemIds).toArray()
    const categoryIds = [...new Set(allItems.map(i => i.categoryId))]
    const categories = await db.categories.where('id').anyOf(categoryIds).toArray()

    const uuid = uuidv4()

    // Deep copy snapshot
    const snapshot: PublicPage['snapshot'] = {
      user: { ...user! },
      categories: categories.map(c => ({ ...c, id: c.id! })),
      items: allItems.map(i => ({ ...i, id: i.id! }))
    }

    await db.publicPages.add({
      uuid,
      userId,
      title,
      description,
      snapshot,
      qrSettings,
      createdAt: new Date(),
      scanCount: 0
    })

    await load()
    return uuid
  }

  const deletePage = async (id: number) => {
    await db.publicPages.delete(id)
    await load()
  }

  const updateQRSettings = async (id: number, qrSettings: PublicPage['qrSettings']) => {
    await db.publicPages.update(id, { qrSettings })
    await load()
  }

  return { pages, loading, generateQR, deletePage, updateQRSettings, refresh: load }
}

export async function getPublicPageByUUID(uuid: string): Promise<PublicPage | undefined> {
  return db.publicPages.where('uuid').equals(uuid).first()
}

// ─── Analytics Hooks ─────────────────────────────────────────────────────────

export async function logScan(pageUuid: string) {
  await db.analytics.add({
    pageUuid,
    eventType: 'scan',
    userAgent: navigator.userAgent,
    timestamp: new Date()
  })
  // Increment scan count
  const page = await db.publicPages.where('uuid').equals(pageUuid).first()
  if (page?.id) {
    await db.publicPages.update(page.id, { scanCount: (page.scanCount || 0) + 1 })
  }
}

export function useAnalytics(userId: number) {
  const [stats, setStats] = useState<{
    totalScans: number
    scansByPage: Array<{ uuid: string; title: string; scans: number; date: string }>
    scansByDay: Array<{ date: string; scans: number }>
    recentEvents: AnalyticsEvent[]
  }>({ totalScans: 0, scansByPage: [], scansByDay: [], recentEvents: [] })

  useEffect(() => {
    async function load() {
      const pages = await db.publicPages.where('userId').equals(userId).toArray()
      const pageUuids = pages.map(p => p.uuid)
      const events = await db.analytics.where('pageUuid').anyOf(pageUuids).toArray()

      const totalScans = events.filter(e => e.eventType === 'scan').length

      const scansByPage = pages.map(p => ({
        uuid: p.uuid,
        title: p.title,
        scans: events.filter(e => e.pageUuid === p.uuid && e.eventType === 'scan').length,
        date: p.createdAt.toLocaleDateString()
      }))

      // Group by day (last 7 days)
      const now = new Date()
      const scansByDay = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toLocaleDateString()
        return {
          date: dateStr,
          scans: events.filter(e => new Date(e.timestamp).toLocaleDateString() === dateStr).length
        }
      })

      const recentEvents = events.slice(-20).reverse()

      setStats({ totalScans, scansByPage, scansByDay, recentEvents })
    }
    load()
  }, [userId])

  return stats
}
