import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SyncService } from "../services/SyncService";
import { OfflineDataService } from "../services/OfflineDataService";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sanitizeForUpsert } from '../utils/sanitize'

export const useOfflineDataStore = defineStore("offlineData", () => {
	// Services
	const syncService = SyncService.getInstance();
	const offlineService = OfflineDataService.getInstance();

	// State
	const isOnline = ref(navigator.onLine);
	const isSyncing = ref(false);
	const lastSyncTime = ref<Date | null>(null);
	const pendingOperations = ref(0);

	// Network status listeners
	window.addEventListener("online", () => {
		isOnline.value = true;
		syncPendingData();
	});

	window.addEventListener("offline", () => {
		isOnline.value = false;
	});

	// Listen for sync requests
	window.addEventListener("data-sync-requested", async (event: Event) => {
		const customEvent = event as CustomEvent;
		pendingOperations.value = customEvent.detail.operations.length;
	});

	// Computed
	const networkStatus = computed(() => {
		return isOnline.value ? "Online" : "Offline";
	});

	// Actions
	async function syncPendingData() {
		if (!isOnline.value || isSyncing.value) return;

		isSyncing.value = true;
		try {
			await offlineService.syncQueuedOperations();
			lastSyncTime.value = new Date();
		} catch (error) {
			console.error("Error syncing data:", error);
		} finally {
			isSyncing.value = false;
			// Update pending operations
			const db = await (offlineService as any).db;
			pendingOperations.value = await db.count("syncQueue");
		}
	}

	// Initialize data for offline use
	async function initializeOfflineData() {
		if (isOnline.value) {
			try {
				await syncService.initialize();
				lastSyncTime.value = new Date();
			} catch (error) {
				console.error("Error initializing offline data:", error);
			}
		}
	}

	// Reset IndexedDB in case of schema issues
	async function resetDatabase() {
		try {
			await offlineService.resetDatabase();
			lastSyncTime.value = null;
			pendingOperations.value = 0;
			return true;
		} catch (error) {
			console.error("Error resetting database:", error);
			return false;
		}
	}

	// Generic data operations with offline support
	async function fetchData(table: string) {
		try {
			if (isOnline.value) {
				return await syncService.fetchAndCacheData(table);
			} else {
				return await offlineService.getAllData(table as any);
			}
		} catch (error) {
			console.error(`Error fetching ${table}:`, error);
			return [];
		}
	}

	async function getById(table: string, id: string) {
		try {
			// First check local cache
			const localData = await offlineService.getDataById(
				table as any,
				id
			);

			// If online and not found locally, try to fetch from server
			if (!localData && isOnline.value) {
				const { data, error } = await supabase
					.from(table)
					.select("*")
					.eq("id", id)
					.single();

				if (error) throw error;
				if (data) {
					// Cache the data
					await offlineService.saveData(table as any, data);
					return data;
				}
			}

			return localData;
		} catch (error) {
			console.error(`Error getting ${table} by ID:`, error);
			return null;
		}
	}

	async function saveData(table: string, data: any) {
		try {
			// Ensure we have an ID
			if (!data.id) {
				data.id = uuidv4();
			}

			// Save to local storage first
			await offlineService.saveData(table as any, data);

			// If online, sync immediately
			if (isOnline.value) {
				const row = sanitizeForUpsert(table, data);
				const { error } = await supabase
					.from(table)
					.upsert(row, { onConflict: "id" });

				if (error) throw error;
			}

			return data;
		} catch (error) {
			console.error(`Error saving ${table}:`, error);
			throw error;
		}
	}

	async function deleteData(table: string, id: string) {
		try {
			// Delete from local storage first
			await offlineService.deleteData(table as any, id);

			// If online, sync immediately
			if (isOnline.value) {
				const { error } = await supabase
					.from(table)
					.delete()
					.eq("id", id);

				if (error) throw error;
			}
		} catch (error) {
			console.error(`Error deleting ${table}:`, error);
			throw error;
		}
	}

	return {
		isOnline,
		isSyncing,
		lastSyncTime,
		pendingOperations,
		networkStatus,
		syncPendingData,
		initializeOfflineData,
		resetDatabase,
		fetchData,
		getById,
		saveData,
		deleteData,
	};
});
