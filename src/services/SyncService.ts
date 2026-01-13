import { supabase } from "../lib/supabase";
import { OfflineDataService } from "./OfflineDataService";

interface SyncOperation {
	id?: number;
	operation: "create" | "update" | "delete";
	table: string;
	payload: any;
	timestamp: number;
}

export class SyncService {
	private offlineService: OfflineDataService;
	private static instance: SyncService;

	private constructor() {
		this.offlineService = OfflineDataService.getInstance();

		// Listen for sync events
		window.addEventListener(
			"data-sync-requested",
			(event) => {
				void this.handleSyncRequest(event as CustomEvent);
			}
		);
	}

	// Singleton pattern
	public static getInstance(): SyncService {
		if (!SyncService.instance) {
			SyncService.instance = new SyncService();
		}
		return SyncService.instance;
	}

	// Handle sync request event
	private async handleSyncRequest(event: CustomEvent): Promise<void> {
		const operations: SyncOperation[] = event.detail.operations;
		const processedIds: number[] = [];

		// Process each operation
		for (const op of operations) {
			try {
				await this.processOperation(op);
				if (op.id) processedIds.push(op.id);
			} catch (error) {
				console.error(
					`Error syncing operation ${op.operation} on ${op.table}:`,
					error
				);
			}
		}

		// Clear processed operations from queue
		if (processedIds.length > 0) {
			await this.offlineService.clearFromSyncQueue(processedIds);
		}
	}

	// Process a single operation
	private async processOperation(op: SyncOperation): Promise<void> {
		switch (op.operation) {
			case "create":
			case "update":
				// strip relations → foreign keys
				const row = this.sanitizePayload(op.table, op.payload);
				await this.upsertData(op.table, row);
				break;
			case "delete":
				await this.deleteData(op.table, op.payload.id);
				break;
		}
	}

	// remove nested objects and map fk columns
	private sanitizePayload(table: string, data: any): any {
		switch (table) {
			case "job_applications": {
				const {
					company,
					// drop any other nested objects you might have pulled in…
					...rest
				} = data;
				return {
					...rest,
					company_id:
						company && typeof company === "object"
							? company.id
							: company,
				};
			}
			case "contacts": {
				const { company, ...rest } = data;
				return {
					...rest,
					company_id:
						company && typeof company === "object"
							? company.id
							: company,
				};
			}
			case "interviews": {
				const { job_application, contact, ...rest } = data;
				return {
					...rest,
					job_application_id:
						job_application && typeof job_application === "object"
							? job_application.id
							: job_application,
					contact_id:
						contact && typeof contact === "object"
							? contact.id
							: contact,
				};
			}
			// companies table has no nested relations
			case "companies":
			default:
				// drop any phantom fields:
				const clean: any = {};
				for (const key of Object.keys(data)) {
					if (
						[
							"id",
							"name",
							"website",
							"industry",
							"location",
							"description",
							"company_size",
							"notes",
							"created_at",
							"updated_at",
							"user_id",
						].includes(key)
					) {
						clean[key] = (data as any)[key];
					}
				}
				return clean;
		}
	}

	// Create or update data in Supabase
	private async upsertData(table: string, row: any): Promise<void> {
		const { error } = await supabase
			.from(table)
			.upsert(row, { onConflict: "id" });

		if (error) throw error;
	}

	// Delete data from Supabase
	private async deleteData(table: string, id: string): Promise<void> {
		const { error } = await supabase.from(table).delete().eq("id", id);

		if (error) throw error;
	}

	// Fetch data from Supabase and store it in IndexedDB
	public async fetchAndCacheData(table: string): Promise<any[]> {
		// Only fetch if online
		if (!this.offlineService.isOnline()) {
			// Return cached data
			return this.offlineService.getAllData(table as any);
		}

		const { data, error } = await supabase.from(table).select("*");

		if (error) throw error;

		// Cache all data
		if (data && data.length > 0) {
			for (const item of data) {
				await this.offlineService.saveData(table as any, item);
			}
		}

		return data || [];
	}

	// Initialize sync when app loads
	public async initialize(): Promise<void> {
		// Cache commonly used data when coming online
		if (this.offlineService.isOnline()) {
			try {
				await Promise.all([
					this.fetchAndCacheData("job_applications"),
					this.fetchAndCacheData("interviews"),
					this.fetchAndCacheData("contacts"),
					this.fetchAndCacheData("companies"),
				]);
			} catch (error) {
				console.error("Error initializing sync service:", error);
			}
		}

		// Try to sync any pending operations
		await this.offlineService.syncQueuedOperations();
	}
}
