// src/db/db.ts
import Dexie, { Table } from 'dexie'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemType = 'url' | 'text' | 'file' | 'video' | 'music'

export interface User {
  id?: number
  name: string
  bio: string
  avatar?: string       // base64 data URL
  email?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id?: number
  userId: number
  name: string
  icon?: string
  color?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Item {
  id?: number
  categoryId: number
  userId: number
  title: string
  type: ItemType
  value: string         // URL, text content, base64 file, etc.
  description?: string
  thumbnailUrl?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PublicPage {
  id?: number
  uuid: string          // unique ID for /p/[uuid] route
  userId: number
  title: string
  description?: string
  themeColor?: string
  // Snapshot of data at generation time
  snapshot: {
    user: Omit<User, 'id'>
    categories: Array<Omit<Category, 'id'> & { id: number }>
    items: Array<Omit<Item, 'id'> & { id: number }>
  }
  qrSettings: {
    fgColor: string
    bgColor: string
    logoDataUrl?: string
    size: number
  }
  createdAt: Date
  scanCount: number
}

export interface AnalyticsEvent {
  id?: number
  pageUuid: string
  eventType: 'scan' | 'view' | 'click'
  itemId?: number
  referrer?: string
  userAgent?: string
  timestamp: Date
}

// ─── Database ─────────────────────────────────────────────────────────────────

export class ConnectHubDB extends Dexie {
  users!: Table<User>
  categories!: Table<Category>
  items!: Table<Item>
  publicPages!: Table<PublicPage>
  analytics!: Table<AnalyticsEvent>

  constructor() {
    super('ConnectHubPro')

    this.version(1).stores({
      users:       '++id, name, email, createdAt',
      categories:  '++id, userId, name, order, createdAt',
      items:       '++id, categoryId, userId, title, type, order, isActive, createdAt',
      publicPages: '++id, uuid, userId, createdAt, scanCount',
      analytics:   '++id, pageUuid, eventType, timestamp'
    })
  }
}

export const db = new ConnectHubDB()

// ─── Seed Default User ─────────────────────────────────────────────────────────

export async function ensureDefaultUser(): Promise<number> {
  const existing = await db.users.toArray()
  if (existing.length > 0) return existing[0].id!

  const id = await db.users.add({
    name: 'My Profile',
    bio:  'Welcome to my Connect HUB Pro profile!',
    email: '',
    phone: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }) as number

  // Seed a default category
  const catId = await db.categories.add({
    userId: id,
    name: 'Social Links',
    icon: '🔗',
    color: '#7C3AED',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }) as number

  // Seed default items
  await db.items.bulkAdd([
    {
      categoryId: catId,
      userId: id,
      title: 'LinkedIn',
      type: 'url',
      value: 'https://linkedin.com',
      description: 'Connect with me on LinkedIn',
      order: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      categoryId: catId,
      userId: id,
      title: 'GitHub',
      type: 'url',
      value: 'https://github.com',
      description: 'Check out my code',
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  return id
}
