export function sanitizeForUpsert(table: string, data: any): any {
	if (table === "job_applications") {
		const { company, companies, ...rest } = data;
		const companyObj = company ?? companies;
		return {
			...rest,
			company_id:
				companyObj && typeof companyObj === "object"
					? companyObj.id
					: companyObj,
		};
	}
	return data;
}