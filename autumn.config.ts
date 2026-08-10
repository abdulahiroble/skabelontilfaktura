import { feature, item, plan } from 'atmn';

export const cloudStorage = feature({
	id: 'cloud_storage',
	name: 'Cloud storage',
	type: 'boolean'
});

export const clientDatabase = feature({
	id: 'client_database',
	name: 'Client database',
	type: 'boolean'
});

export const saftExport = feature({
	id: 'saft_export',
	name: 'CSV accounting export',
	type: 'boolean'
});

export const reminderEmails = feature({
	id: 'reminder_emails',
	name: 'Reminder emails',
	type: 'boolean'
});

export const crossDeviceNumbering = feature({
	id: 'cross_device_numbering',
	name: 'Cross-device numbering',
	type: 'boolean'
});

export const multiUser = feature({
	id: 'multi_user',
	name: 'Team seats',
	type: 'metered',
	consumable: false
});

export const apiAccess = feature({
	id: 'api_access',
	name: 'API access',
	type: 'boolean'
});

export const whiteLabel = feature({
	id: 'white_label',
	name: 'White-label PDFs',
	type: 'boolean'
});

export const templatePack = feature({
	id: 'template_pack',
	name: 'Premium template pack',
	type: 'boolean'
});

export const branchBundle = feature({
	id: 'branch_bundle',
	name: 'Branch-specific template bundle',
	type: 'boolean'
});

const proItems = [
	item({ featureId: cloudStorage.id }),
	item({ featureId: clientDatabase.id }),
	item({ featureId: saftExport.id }),
	item({ featureId: reminderEmails.id }),
	item({ featureId: crossDeviceNumbering.id })
];

export const pro = plan({
	id: 'pro',
	name: 'Pro',
	group: 'subscription',
	price: { amount: 49, interval: 'month' },
	items: proItems
});

export const proAnnual = plan({
	id: 'pro_annual',
	name: 'Pro annual',
	group: 'subscription',
	price: { amount: 490, interval: 'year' },
	items: proItems
});

export const business = plan({
	id: 'business',
	name: 'Business',
	group: 'subscription',
	price: { amount: 149, interval: 'month' },
	items: [
		...proItems,
		item({ featureId: multiUser.id, included: 5 }),
		item({ featureId: apiAccess.id }),
		item({ featureId: whiteLabel.id })
	]
});

/** Retained for existing customers, but no longer exposed in checkout. */
export const lifetimePro = plan({
	id: 'lifetime_pro',
	name: 'Lifetime Pro',
	group: 'subscription',
	price: { amount: 999, interval: 'one_off' },
	items: proItems
});

export const premiumTemplatePack = plan({
	id: 'template_pack',
	name: 'Premium template pack',
	addOn: true,
	price: { amount: 149, interval: 'one_off' },
	items: [item({ featureId: templatePack.id })]
});

export const branchSpecificBundle = plan({
	id: 'branch_bundle',
	name: 'Branch-specific template bundle',
	addOn: true,
	price: { amount: 249, interval: 'one_off' },
	items: [item({ featureId: branchBundle.id })]
});
