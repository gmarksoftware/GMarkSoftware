/**
 * Seeded on first start (only if a key doesn't exist yet), taken from the content document.
 * `null` = "not provided / not verified yet". The website hides any null value
 * instead of showing a made-up number or a "XX+" placeholder.
 * Update them later from /admin → Settings.
 */
export const DEFAULT_SETTINGS: Record<string, Record<string, unknown>> = {
  stats: {
    foundedYear: '2026',
    workshops: '50+',
    participants: '500+',
    youthReached: '50+',
    beneficiaries: null, // "XX+" in the document – awaiting verified number
    communityInitiatives: null, // "XX+" in the document – awaiting verified number
  },
  contact: {
    organization: 'Gram Guru Foundation',
    founder: 'Shri. Gurudas Maruthi Bhikle',
    office: 'Nesari, Maharashtra',
    address: 'Near Gmark Software Pvt. Ltd., Nesari, Gadhinglaj, Kolhapur, Maharashtra – 416504',
    phone: null, // [ADD PHONE NUMBER]
    email: null, // [ADD EMAIL ADDRESS]
  },
  donation: {
    // Document: add only after receiving verified information from the Foundation.
    paymentLink: null,
    upiId: null,
    accountName: null,
    bankName: null,
    accountNumber: null,
    ifsc: null,
    registrationDetails: null,
    taxInformation: null,
  },
  social: { facebook: null, instagram: null, youtube: null, whatsapp: null },
};
