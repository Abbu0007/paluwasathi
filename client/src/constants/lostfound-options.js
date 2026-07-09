export const REPORT_TYPES = [
  { value: 'lost', label: 'Lost Pet', desc: 'My pet is missing' },
  { value: 'found', label: 'Found Pet', desc: 'I found an animal' },
];

export const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'other', label: 'Other' },
];

export const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' },
];

export const COMMON_COLORS = [
  'Black', 'White', 'Brown', 'Golden', 'Grey',
  'Orange', 'Cream', 'Black and white', 'Brown and white', 'Tabby',
];

export const LF_SORT = [
  { value: 'newest', label: 'Recently reported' },
  { value: 'date_desc', label: 'Most recent sighting' },
  { value: 'oldest', label: 'Oldest first' },
];

export const matchStrength = (score) => {
  if (score >= 100) return { label: 'Strong match', color: 'primary' };
  if (score >= 75) return { label: 'Likely match', color: 'accent' };
  return { label: 'Possible match', color: 'neutral' };
};