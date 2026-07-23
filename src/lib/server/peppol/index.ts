/**
 * Barrel export for the Peppol integration module.
 *
 * Re-exports the public surface used by routes and other server modules.
 * Internal helpers that are not part of the public API (e.g. the stub adapter
 * class internals) are still reachable via their submodules when needed.
 */
export type {
	PeppolParticipant,
	PeppolLookupResult,
	PeppolInvoiceLine,
	PeppolInvoiceTotals,
	PeppolInvoicePayload,
	PeppolSendResult,
	PeppolAdapter
} from './types';

export { EAS_CODES, StubPeppolAdapter, createPeppolAdapter } from './adapter';

export { buildPeppolPayload, deriveEasCode } from './builder';
