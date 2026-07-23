/**
 * Barrel export for server-side database queries.
 *
 * Route handlers import from here so the per-request `db` instance and query
 * helpers stay co-located.
 */
export {
	getClients,
	getClientForBusiness,
	createClient,
	updateClient,
	deleteClient,
	type NewClient,
	type ClientUpdate
} from './clients';

export { getBusinessByUserId } from './businesses';

export { generateNextInvoiceNumber } from './invoice-numbering';
