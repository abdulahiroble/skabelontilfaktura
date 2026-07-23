/**
 * Peppol Access Point adapter.
 *
 * This module provides:
 * - The official EAS (Electronic Address Scheme) code registry for Nordic
 *   countries, used to identify Peppol participants.
 * - `StubPeppolAdapter`, a placeholder implementation of the
 *   {@link PeppolAdapter} contract. It performs no network I/O and always
 *   reports participants as unreachable / sends as failed. It exists so the
 *   rest of the application (lookup endpoint, builder, settings UI) can be
 *   built and shipped before an Access Point partner is selected.
 * - `createPeppolAdapter`, a factory that today always returns the stub but is
 *   the single place that will dispatch to a real provider once credentials
 *   are configured (e.g. `PEPPOL_PROVIDER=storecove`).
 *
 * The adapter interface is deliberately provider-agnostic so Storecove, Pagero,
 * or Tradeshift can be swapped in later without touching the builder or routes.
 */
import type {
	PeppolAdapter,
	PeppolInvoicePayload,
	PeppolLookupResult,
	PeppolParticipant,
	PeppolSendResult
} from './types';

/**
 * Peppol Electronic Address Scheme (EAS) codes.
 *
 * Source: the Peppol EAS code list maintained by OpenPeppol. Each entry maps a
 * national/regional identifier scheme to the 4-digit code used in the
 * `<cbc:EndpointID>` element of a BIS Billing 3.0 invoice.
 *
 * Only the codes relevant to our launch markets are listed; the registry is
 * extensible if/when we expand to other countries.
 */
export const EAS_CODES = {
	DK_CVR: '0184', // Danish CVR (Det Centrale Virksomhedsregister)
	DK_EAN: '9901', // Danish EAN/GLN (used by the public sector)
	SE_ORG: '0007', // Swedish organisation number
	NO_ORG: '9908', // Norwegian organisation number
	DE_VAT: '9930', // German VAT number
	NL_VAT: '0106' // Dutch VAT number
} as const;

/**
 * Stub Access Point adapter.
 *
 * Returned by {@link createPeppolAdapter} until a real provider is configured.
 * It deliberately returns pessimistic results so the UI surfaces "not
 * available via Peppol" / "not yet configured" rather than silently succeeding.
 */
export class StubPeppolAdapter implements PeppolAdapter {
	async lookupParticipant(participant: PeppolParticipant): Promise<PeppolLookupResult> {
		// TODO: Replace with an actual Access Point participant-directory API call.
		// For now: return reachable=false so the UI shows "not available via Peppol".
		return {
			reachable: false,
			participant
		};
	}

	async sendInvoice(payload: PeppolInvoicePayload): Promise<PeppolSendResult> {
		// TODO: Replace with an actual Access Point send API call. The invoice
		// number is echoed back in the error so callers can correlate the failed
		// send in logs.
		return {
			success: false,
			error: `Peppol integration not yet configured for invoice ${payload.invoiceNumber}. Choose an Access Point partner in settings.`
		};
	}
}

/**
 * Factory for the active Peppol adapter.
 *
 * Today this always returns the stub. When a provider is selected, branch on
 * an environment variable here, e.g.:
 *
 * ```ts
 * if (env.PEPPOL_PROVIDER === 'storecove') return new StorecoveAdapter(env);
 * if (env.PEPPOL_PROVIDER === 'pagero')    return new PageroAdapter(env);
 * ```
 *
 * Keeping this as the single dispatch point means the rest of the app only
 * ever depends on the {@link PeppolAdapter} interface.
 */
export function createPeppolAdapter(): PeppolAdapter {
	return new StubPeppolAdapter();
}
