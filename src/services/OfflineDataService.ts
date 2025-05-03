import { openDB, IDBPDatabase, deleteDB } from 'idb';

// Define the database schema
interface JobTrackerDB {
  job_applications: {
    id: string;
    title: string;
    company: any;
    status: string;
    applied_date: Date;
    [key: string]: any;
  };
  interviews: {
    id: string;
    job_application_id: string;
    interview_type: string;
    interview_date: Date;
    status: string;
    [key: string]: any;
  };
  contacts: {
    id: string;
    name: string;
    email: string;
    [key: string]: any;
  };
  companies: {
    id: string;
    name: string;
    [key: string]: any;
  };
  syncQueue: {
    id?: number;
    operation: 'create' | 'update' | 'delete';
    table: string;
    payload: any;
    timestamp: number;
  };
}

export class OfflineDataService {
  private db: Promise<IDBPDatabase<JobTrackerDB>>;
  private static instance: OfflineDataService;
  private networkStatus: boolean = navigator.onLine;

  private constructor() {
    // Initialize the IndexedDB database
    this.db = this.initDatabase();
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleNetworkChange.bind(this));
    window.addEventListener('offline', this.handleNetworkChange.bind(this));
  }
  
  private initDatabase(): Promise<IDBPDatabase<JobTrackerDB>> {
    return openDB<JobTrackerDB>('job-tracker-db', 2, {
      upgrade(db, oldVersion, newVersion) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('job_applications')) {
          db.createObjectStore('job_applications', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('interviews')) {
          db.createObjectStore('interviews', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('companies')) {
          db.createObjectStore('companies', { keyPath: 'id' });
        }
        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  // Singleton pattern
  public static getInstance(): OfflineDataService {
    if (!OfflineDataService.instance) {
      OfflineDataService.instance = new OfflineDataService();
    }
    return OfflineDataService.instance;
  }
  
  // Reset database in case of schema issues
  public async resetDatabase(): Promise<void> {
    try {
      // Close current database connection
      const currentDb = await this.db;
      currentDb.close();
      
      // Delete the database
      await deleteDB('job-tracker-db');
      
      // Reinitialize
      this.db = this.initDatabase();
      
      console.log('IndexedDB database has been reset');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }

  private handleNetworkChange(event: Event): void {
    this.networkStatus = navigator.onLine;
    if (this.networkStatus) {
      // When we come back online, try to sync
      this.syncQueuedOperations();
    }
    
    // Dispatch a custom event for the app to respond to
    window.dispatchEvent(new CustomEvent('network-status-change', { 
      detail: { online: this.networkStatus } 
    }));
  }

  // Get network status
  public isOnline(): boolean {
    return this.networkStatus;
  }

  // Generic method to save data to a store
  public async saveData<T>(storeName: keyof JobTrackerDB, data: T): Promise<T> {
    const db = await this.db;
    await db.put(storeName, data);
    
    // Add to sync queue if offline
    if (!this.networkStatus) {
      await this.addToSyncQueue('update', storeName.toString(), data);
    }
    
    return data;
  }

  // Generic method to get all data from a store
  public async getAllData<T>(storeName: keyof JobTrackerDB): Promise<T[]> {
    const db = await this.db;
    return db.getAll(storeName);
  }

  // Generic method to get data by ID
  public async getDataById<T>(storeName: keyof JobTrackerDB, id: string): Promise<T | undefined> {
    const db = await this.db;
    return db.get(storeName, id);
  }

  // Generic method to delete data
  public async deleteData(storeName: keyof JobTrackerDB, id: string): Promise<void> {
    const db = await this.db;
    await db.delete(storeName, id);
    
    // Add to sync queue if offline
    if (!this.networkStatus) {
      await this.addToSyncQueue('delete', storeName.toString(), { id });
    }
  }

  // Add operation to sync queue
  private async addToSyncQueue(
    operation: 'create' | 'update' | 'delete',
    table: string,
    payload: any
  ): Promise<void> {
    const db = await this.db;
    await db.add('syncQueue', {
      operation,
      table,
      payload,
      timestamp: Date.now()
    });
  }

  // Process sync queue when back online
  public async syncQueuedOperations(): Promise<void> {
    if (!this.networkStatus) return;

    const db = await this.db;
    const syncQueue = await db.getAll('syncQueue');
    
    // Sort by timestamp
    syncQueue.sort((a, b) => a.timestamp - b.timestamp);
    
    // Dispatch event for the app to handle sync
    window.dispatchEvent(new CustomEvent('data-sync-requested', { 
      detail: { operations: syncQueue } 
    }));
  }

  // Clear processed items from sync queue
  public async clearFromSyncQueue(ids: number[]): Promise<void> {
    const db = await this.db;
    const tx = db.transaction('syncQueue', 'readwrite');
    
    for (const id of ids) {
      await tx.store.delete(id);
    }
    
    await tx.done;
  }
} 