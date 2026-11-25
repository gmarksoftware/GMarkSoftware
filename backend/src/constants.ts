// Categories come straight from the "Gallery Categories" list in the content document.
export const CATEGORIES = [
  'workshops',
  'training',
  'social',
  'community',
  'awareness',
  'events',
  'entrepreneurship',
  'education',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const LABEL_TO_CATEGORY: Record<string, string> = {
  workshops: 'workshops',
  training: 'training',
  social: 'social',
  community: 'community',
  awareness: 'awareness',
  events: 'events',
  entrepreneurship: 'entrepreneurship',
  education: 'education',
  'training programs': 'training',
  'social activities': 'social',
  'community programs': 'community',
  'awareness programs': 'awareness',
  'entrepreneurship programs': 'entrepreneurship',
  'education & skill programs': 'education',
  'education & skills': 'education',
  'education and skill programs': 'education',
};

// The four "Ways to Get Involved" from the content document.
export const VOLUNTEER_INTERESTS = ['volunteer', 'partner', 'support', 'participate'] as const;

export const PHONE_REGEX = /^\+?[0-9][0-9\s-]{7,14}$/;
