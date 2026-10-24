import type { RequestHandler } from './$types';

export const prerender = false;

/** Public sales switch, not a provider-health or payment-confirmation endpoint. */
export const GET: RequestHandler = ({ platform }) => {
	const env = platform?.env;
	const available =
		env?.KIT_CHECKOUT_ENABLED === 'true' && /^txr_[a-zA-Z0-9]+$/.test(env.KIT_VAT_RATE_ID ?? '');
	return Response.json(
		{ available },
		{
			headers: {
				'Cache-Control': 'no-store',
				'X-Robots-Tag': 'noindex'
			}
		}
	);
};
