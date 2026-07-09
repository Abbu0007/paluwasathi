export const CATEGORIES = [
  { value: 'medical', label: 'Medical' },
  { value: 'shelter', label: 'Shelter' },
  { value: 'food', label: 'Food' },
  { value: 'rescue', label: 'Rescue' },
  { value: 'sterilization', label: 'Sterilization' },
  { value: 'other', label: 'Other' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'most_funded', label: 'Most funded' },
  { value: 'least_funded', label: 'Needs most help' },
  { value: 'ending_soon', label: 'Ending soon' },
];

export const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const PAYMENT_METHODS = [
  { value: 'esewa', label: 'eSewa', desc: 'Nepal digital wallet' },
  { value: 'khalti', label: 'Khalti', desc: 'Nepal digital wallet' },
  { value: 'card', label: 'Card', desc: 'Visa or Mastercard' },
  { value: 'bank', label: 'Bank Transfer', desc: 'Direct deposit' },
];

export const formatNPR = (amount) => {
  if (amount === null || amount === undefined) return 'NPR 0';
  return 'NPR ' + Number(amount).toLocaleString('en-IN');
};