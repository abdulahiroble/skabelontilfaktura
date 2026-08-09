import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDanishDate(value: Date | string | null): string {
	if (!value) return '—';
	return new Intl.DateTimeFormat('da-DK').format(new Date(value));
}

export function formatMoney(value: string | number | null, currency: string): string {
	return new Intl.NumberFormat('da-DK', {
		style: 'currency',
		currency
	}).format(Number(value ?? 0));
}

export function isUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
