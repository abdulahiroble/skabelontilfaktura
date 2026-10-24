/** Approved paid pilot. Price changes require a new reviewed catalog release + atmn push. */
export const KIT = {
	id: 'fakturapakken_v1',
	name: 'Fakturapakken',
	version: '1',
	price: 99,
	priceMinor: 9900,
	currency: 'DKK',
	vatInclusive: true,
	vatRate: 0.25,
	netMinor: 7920,
	vatMinor: 1980,
	fileCount: 8,
	supportEmail: 'kontakt@skabelontilfaktura.dk',
	downloadUrl: '/api/downloads/kit',
	accountUrl: '/konto/',
	loginUrl: '/login/?next=%2Fpris%2F'
} as const;
