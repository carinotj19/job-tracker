import { v4 as uuidv4 } from 'uuid'
import {
  createDemoDatabase,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_ID,
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  type DemoDatabase,
  type DemoUserRow
} from '../demo/demoData'

type DemoAuthUser = {
  id: string
  email: string
  created_at: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
  aud: string
  role: string
}

type DemoSession = {
  user: DemoAuthUser
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
}

const DB_VERSION = 1
const DB_STORAGE_KEY = 'job-tracker-demo-db-v1'
const SESSION_STORAGE_KEY = 'job-tracker-demo-session-v1'
const HAS_STORAGE = typeof localStorage !== 'undefined'

let memoryDb: DemoDatabase | null = null
let memorySession: DemoSession | null = null

function normalizeDb(db: DemoDatabase): DemoDatabase {
  return {
    companies: db.companies ?? [],
    contacts: db.contacts ?? [],
    job_applications: db.job_applications ?? [],
    interviews: db.interviews ?? [],
    users: db.users ?? []
  }
}

function seedDb(): DemoDatabase {
  const db = createDemoDatabase()
  saveDb(db)
  return db
}

function loadDb(): DemoDatabase {
  if (!HAS_STORAGE) {
    if (!memoryDb) memoryDb = createDemoDatabase()
    return normalizeDb(memoryDb)
  }
  const raw = localStorage.getItem(DB_STORAGE_KEY)
  if (!raw) return seedDb()
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.version !== DB_VERSION || !parsed?.data) return seedDb()
    return normalizeDb(parsed.data as DemoDatabase)
  } catch {
    return seedDb()
  }
}

function saveDb(db: DemoDatabase) {
  if (!HAS_STORAGE) {
    memoryDb = db
    return
  }
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify({ version: DB_VERSION, data: db }))
}

function loadSession(): DemoSession | null {
  if (!HAS_STORAGE) return memorySession
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoSession
  } catch {
    return null
  }
}

function saveSession(session: DemoSession | null) {
  if (!HAS_STORAGE) {
    memorySession = session
    return
  }
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function ensureUserRecord(email: string, preferredId?: string): DemoUserRow {
  const db = loadDb()
  const now = new Date().toISOString()
  let user = db.users.find((item) => item.email === email)
  if (!user) {
    user = {
      id: preferredId ?? uuidv4(),
      email,
      created_at: now,
      last_sign_in_at: now
    }
    db.users.push(user)
  } else {
    user.last_sign_in_at = now
  }
  saveDb(db)
  return user
}

function buildSession(email: string, preferredId?: string): DemoSession {
  const userRecord = ensureUserRecord(email, preferredId)
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60
  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
      created_at: userRecord.created_at,
      app_metadata: { provider: 'demo' },
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated'
    },
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_at: expiresAt,
    token_type: 'bearer'
  }
}

type Filter = { op: 'eq' | 'ilike' | 'gte' | 'lte'; column: string; value: any }

function mapTableName(table: string): keyof DemoDatabase {
  if (table === 'applications') return 'job_applications'
  return table as keyof DemoDatabase
}

function getTable(db: DemoDatabase, table: keyof DemoDatabase): any[] {
  const data = (db as any)[table]
  if (!Array.isArray(data)) {
    ;(db as any)[table] = []
    return (db as any)[table]
  }
  return data
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function toDateValue(value: any): number | null {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) return parsed
  }
  return null
}

function compareValues(a: any, b: any): number {
  const dateA = toDateValue(a)
  const dateB = toDateValue(b)
  if (dateA !== null && dateB !== null) {
    return dateA - dateB
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  return String(a ?? '').localeCompare(String(b ?? ''))
}

function buildIlikeRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.')
  return new RegExp(`^${escaped}$`, 'i')
}

function applyFilters(rows: any[], filters: Filter[]): any[] {
  if (filters.length === 0) return rows
  return rows.filter((row) => {
    return filters.every((filter) => {
      const value = row[filter.column]
      switch (filter.op) {
        case 'eq':
          return value === filter.value
        case 'ilike': {
          if (value === null || value === undefined) return false
          const regex = buildIlikeRegex(String(filter.value ?? ''))
          return regex.test(String(value))
        }
        case 'gte':
          return compareValues(value, filter.value) >= 0
        case 'lte':
          return compareValues(value, filter.value) <= 0
        default:
          return true
      }
    })
  })
}

function normalizeDate(value: any): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return undefined
}

function sanitizeRow(table: string, row: any): any {
  const cleaned = { ...row }
  if (table === 'job_applications') {
    const companyObj = row.company ?? row.companies
    if (!cleaned.company_id && companyObj) {
      cleaned.company_id = typeof companyObj === 'object' ? companyObj.id : companyObj
    }
    delete cleaned.company
    delete cleaned.companies
    delete cleaned.interviews
  }
  if (table === 'contacts') {
    if (!cleaned.company_id && row.company) {
      cleaned.company_id = typeof row.company === 'object' ? row.company.id : row.company
    }
    delete cleaned.company
  }
  if (table === 'companies') {
    delete cleaned.applications
  }
  if (table === 'interviews') {
    delete cleaned.contact
    delete cleaned.job_application
  }
  return cleaned
}

function prepareInsert(table: string, row: any, userId?: string): any {
  const now = new Date().toISOString()
  const cleaned = sanitizeRow(table, row)
  if (!cleaned.id) cleaned.id = uuidv4()
  if (!cleaned.created_at) cleaned.created_at = now
  if (table === 'job_applications') {
    cleaned.updated_at = cleaned.updated_at ?? cleaned.created_at
    cleaned.applied_date = normalizeDate(cleaned.applied_date) ?? cleaned.applied_date
  }
  if (table === 'interviews') {
    cleaned.interview_date = normalizeDate(cleaned.interview_date) ?? cleaned.interview_date
  }
  if (userId && !cleaned.user_id) cleaned.user_id = userId
  return cleaned
}

function applyUpdate(table: string, existing: any, updates: any, userId?: string): any {
  const cleaned = sanitizeRow(table, updates)
  const next = { ...existing, ...cleaned }
  if (table === 'job_applications') {
    next.updated_at = new Date().toISOString()
    if (cleaned.applied_date) {
      next.applied_date = normalizeDate(cleaned.applied_date) ?? cleaned.applied_date
    }
  }
  if (table === 'interviews' && cleaned.interview_date) {
    next.interview_date = normalizeDate(cleaned.interview_date) ?? cleaned.interview_date
  }
  if (userId && !next.user_id) next.user_id = userId
  return next
}

function attachRelations(table: string, rows: any[], db: DemoDatabase): any[] {
  if (table === 'job_applications') {
    return rows.map((row) => {
      const company = row.company_id
        ? db.companies.find((item) => item.id === row.company_id)
        : undefined
      const interviews = db.interviews
        .filter((item) => item.job_application_id === row.id)
        .sort((a, b) => compareValues(a.interview_date, b.interview_date))
      const companyClone = company ? clone(company) : null
      return {
        ...row,
        company: companyClone,
        companies: companyClone,
        interviews: clone(interviews)
      }
    })
  }
  if (table === 'contacts') {
    return rows.map((row) => {
      const company = row.company_id
        ? db.companies.find((item) => item.id === row.company_id)
        : undefined
      return {
        ...row,
        company: company ? clone(company) : null
      }
    })
  }
  if (table === 'companies') {
    return rows.map((row) => {
      const applications = db.job_applications.filter(
        (app) => app.company_id === row.id
      )
      return {
        ...row,
        applications: applications.map((app) => ({ id: app.id }))
      }
    })
  }
  if (table === 'interviews') {
    return rows.map((row) => {
      const contact = row.contact_id
        ? db.contacts.find((item) => item.id === row.contact_id)
        : undefined
      return {
        ...row,
        contact: contact ? clone(contact) : null
      }
    })
  }
  return rows
}

class DemoQueryBuilder {
  private table: string
  private filters: Filter[] = []
  private orderBy: { column: string; ascending: boolean } | null = null
  private limitCount: number | null = null
  private rangeBounds: { from: number; to: number } | null = null
  private singleResult = false
  private selectOptions: { count?: 'exact'; head?: boolean } | null = null
  private action: 'insert' | 'update' | 'delete' | 'upsert' | null = null
  private actionData: any = null
  private returning = false
  private onConflict: string[] = ['id']
  private getSession: () => DemoSession | null

  constructor(table: string, getSession: () => DemoSession | null) {
    this.table = table
    this.getSession = getSession
  }

  select(_columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    this.selectOptions = options ?? null
    if (this.action) this.returning = true
    return this
  }

  insert(values: any) {
    this.action = 'insert'
    this.actionData = Array.isArray(values) ? values : [values]
    return this
  }

  update(values: any) {
    this.action = 'update'
    this.actionData = values
    return this
  }

  delete() {
    this.action = 'delete'
    return this
  }

  upsert(values: any, options?: { onConflict?: string }) {
    this.action = 'upsert'
    this.actionData = Array.isArray(values) ? values : [values]
    if (options?.onConflict) {
      this.onConflict = options.onConflict.split(',').map((item) => item.trim())
    }
    return this
  }

  eq(column: string, value: any) {
    this.filters.push({ op: 'eq', column, value })
    return this
  }

  ilike(column: string, value: string) {
    this.filters.push({ op: 'ilike', column, value })
    return this
  }

  gte(column: string, value: any) {
    this.filters.push({ op: 'gte', column, value })
    return this
  }

  lte(column: string, value: any) {
    this.filters.push({ op: 'lte', column, value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(from: number, to: number) {
    this.rangeBounds = { from, to }
    return this
  }

  single() {
    this.singleResult = true
    if (this.action) this.returning = true
    return this
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected)
  }

  private buildResponse(rows: any[] | null, count: number | null) {
    if (this.singleResult) {
      if (!rows || rows.length !== 1) {
        return {
          data: null,
          error: new Error('Expected a single row in demo mode'),
          count
        }
      }
      return { data: rows[0], error: null, count }
    }
    return { data: rows, error: null, count }
  }

  private async execute() {
    const db = loadDb()
    const tableName = mapTableName(this.table)
    const tableRows = getTable(db, tableName)
    const userId = this.getSession()?.user.id

    if (this.action === 'insert') {
      const inserted = this.actionData.map((row: any) =>
        prepareInsert(tableName, row, userId)
      )
      tableRows.push(...inserted)
      saveDb(db)
      const responseRows = this.returning
        ? attachRelations(tableName, clone(inserted), db)
        : null
      return this.buildResponse(
        responseRows,
        this.selectOptions?.count ? inserted.length : null
      )
    }

    if (this.action === 'update') {
      const updatedRows: any[] = []
      const nextRows = tableRows.map((row: any) => {
        if (applyFilters([row], this.filters).length === 0) {
          return row
        }
        const next = applyUpdate(tableName, row, this.actionData, userId)
        updatedRows.push(next)
        return next
      })
      ;(db as any)[tableName] = nextRows
      saveDb(db)
      const responseRows = this.returning
        ? attachRelations(tableName, clone(updatedRows), db)
        : null
      return this.buildResponse(
        responseRows,
        this.selectOptions?.count ? updatedRows.length : null
      )
    }

    if (this.action === 'delete') {
      const deletedRows: any[] = []
      const remainingRows = tableRows.filter((row: any) => {
        const isMatch = applyFilters([row], this.filters).length > 0
        if (isMatch) deletedRows.push(row)
        return !isMatch
      })
      ;(db as any)[tableName] = remainingRows
      saveDb(db)
      const responseRows = this.returning
        ? attachRelations(tableName, clone(deletedRows), db)
        : null
      return this.buildResponse(
        responseRows,
        this.selectOptions?.count ? deletedRows.length : null
      )
    }

    if (this.action === 'upsert') {
      const updatedRows: any[] = []
      for (const rawRow of this.actionData) {
        const cleaned = sanitizeRow(tableName, rawRow)
        const matchIndex = tableRows.findIndex((row: any) =>
          this.onConflict.every((key) => row[key] === cleaned[key])
        )
        if (matchIndex >= 0) {
          const next = applyUpdate(
            tableName,
            tableRows[matchIndex],
            cleaned,
            userId
          )
          tableRows[matchIndex] = next
          updatedRows.push(next)
        } else {
          const prepared = prepareInsert(tableName, cleaned, userId)
          tableRows.push(prepared)
          updatedRows.push(prepared)
        }
      }
      saveDb(db)
      const responseRows = this.returning
        ? attachRelations(tableName, clone(updatedRows), db)
        : null
      return this.buildResponse(
        responseRows,
        this.selectOptions?.count ? updatedRows.length : null
      )
    }

    let results = applyFilters(tableRows, this.filters)
    if (this.orderBy) {
      results = [...results].sort((a, b) => {
        const diff = compareValues(a[this.orderBy!.column], b[this.orderBy!.column])
        return this.orderBy!.ascending ? diff : -diff
      })
    }
    if (this.rangeBounds) {
      results = results.slice(this.rangeBounds.from, this.rangeBounds.to + 1)
    }
    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount)
    }
    const count = this.selectOptions?.count ? results.length : null
    const rowsWithRelations = attachRelations(tableName, clone(results), db)
    if (this.selectOptions?.head) {
      return this.buildResponse(null, count)
    }
    return this.buildResponse(rowsWithRelations, count)
  }
}

export function createDemoClient() {
  let session = loadSession()
  if (!session) {
    session = buildSession(DEMO_USER_EMAIL, DEMO_USER_ID)
    saveSession(session)
  }

  const listeners = new Set<(event: string, current: DemoSession | null) => void>()

  const notify = (event: string, current: DemoSession | null) => {
    listeners.forEach((callback) => callback(event, current))
  }

  const auth = {
    getSession: async () => ({ data: { session }, error: null }),
    getUser: async () => ({ data: { user: session?.user ?? null }, error: null }),
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      const preferredId =
        email === DEMO_ADMIN_EMAIL
          ? DEMO_ADMIN_ID
          : email === DEMO_USER_EMAIL
            ? DEMO_USER_ID
            : undefined
      session = buildSession(email, preferredId)
      saveSession(session)
      notify('SIGNED_IN', session)
      return { data: { user: session.user, session }, error: null }
    },
    signUp: async ({ email }: { email: string; password: string }) => {
      session = buildSession(email)
      saveSession(session)
      notify('SIGNED_IN', session)
      return { data: { user: session.user, session }, error: null }
    },
    signOut: async () => {
      session = null
      saveSession(session)
      notify('SIGNED_OUT', session)
      return { error: null }
    },
    onAuthStateChange: (callback: (event: string, current: DemoSession | null) => void) => {
      listeners.add(callback)
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback)
            }
          }
        },
        error: null
      }
    }
  }

  return {
    auth,
    from: (table: string) => new DemoQueryBuilder(table, () => session)
  }
}
