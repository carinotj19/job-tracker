import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock window properties
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock indexedDB for offline store testing
class MockIDBFactory {
  open() {
    return {
      result: {
        createObjectStore: vi.fn(),
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            put: vi.fn(),
            get: vi.fn(),
            getAll: vi.fn().mockResolvedValue([]),
            delete: vi.fn()
          })
        })
      },
      addEventListener: vi.fn(),
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };
  }
}

// Define indexedDB in global/window scope
global.indexedDB = new MockIDBFactory() as any;
// Also add to window object explicitly for components that might access window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: new MockIDBFactory()
});

// Create a mock Supabase client with properly chainable methods
const createSupabaseMock = () => {
  // Create a base mock object that returns itself for chainable methods
  const chainable = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    upsert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    delete: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    neq: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    single: vi.fn(() => chainable),
    ilike: vi.fn(() => chainable),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  // Create the from method that initiates the chain
  const from = vi.fn(() => chainable);

  // Create the auth methods
  const auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  };

  return { from, auth };
};

// Mock Supabase
vi.mock('../lib/supabase', () => {
  return {
    supabase: createSupabaseMock()
  }
})

// Mock OfflineDataService
vi.mock('../services/OfflineDataService', () => {
  const mockInstance = {
    initDatabase: vi.fn().mockResolvedValue(null),
    saveData: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    getData: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    deleteData: vi.fn().mockResolvedValue(true)
  }

  return {
    __esModule: true,
    default: {
      getInstance: vi.fn().mockReturnValue(mockInstance)
    },
    // Add named export to match potential named imports
    OfflineDataService: {
      getInstance: vi.fn().mockReturnValue(mockInstance)
    }
  }
})

// Mock SyncService
vi.mock('../services/SyncService', () => {
  const mockInstance = {
    syncData: vi.fn(),
    syncAllData: vi.fn(),
    processPendingOperations: vi.fn()
  }

  return {
    __esModule: true,
    default: {
      getInstance: vi.fn().mockReturnValue(mockInstance)
    },
    // Add named export to match potential named imports
    SyncService: {
      getInstance: vi.fn().mockReturnValue(mockInstance)
    }
  }
})

// Mock PrimeVue components globally
config.global.stubs = {
  'Button': true,
  'Dialog': true,
  'DataTable': true,
  'Column': true,
  'InputText': true,
  'Dropdown': true,
  'Calendar': true,
  'AutoComplete': true,
  'Textarea': true,
  'Tag': true,
}

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
}) 