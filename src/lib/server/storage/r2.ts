/**
 * Cloudflare R2 storage utilities for invoice PDFs and business logos.
 *
 * The `R2Bucket` type is provided globally by the Wrangler-generated
 * `worker-configuration.d.ts` (declared in tsconfig `types`). The bucket is
 * bound to the worker via the `INVOICES_BUCKET` binding in `wrangler.jsonc`.
 */

export interface UploadResult {
	key: string;
	size: number;
	etag: string;
}

export async function uploadToR2(
	bucket: R2Bucket,
	key: string,
	data: ReadableStream | ArrayBuffer | string,
	options?: { contentType?: string; customMetadata?: Record<string, string> }
): Promise<UploadResult> {
	const result = await bucket.put(key, data, {
		httpMetadata: options?.contentType ? { contentType: options.contentType } : undefined,
		customMetadata: options?.customMetadata
	});
	if (!result) {
		throw new Error(`R2 upload failed for key: ${key}`);
	}
	return { key, size: result.size, etag: result.etag };
}

export async function getFromR2(bucket: R2Bucket, key: string) {
	return bucket.get(key);
}

export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
	await bucket.delete(key);
}

export function generateInvoiceKey(
	businessId: string,
	invoiceNumber: string,
	format: string = 'pdf'
): string {
	const year = new Date().getFullYear();
	return `invoices/${businessId}/${year}/${invoiceNumber}.${format}`;
}

export function generateLogoKey(businessId: string, ext: string = 'png'): string {
	return `logos/${businessId}/logo.${ext}`;
}
