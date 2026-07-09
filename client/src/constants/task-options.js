export const TASK_CATEGORIES = [
  { value: 'rescue_drive', label: 'Rescue Drive' },
  { value: 'shelter_shift', label: 'Shelter Shift' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'medical_camp', label: 'Medical Camp' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'other', label: 'Other' },
];

export const TASK_SORT = [
  { value: 'soonest', label: 'Starting soonest' },
  { value: 'newest', label: 'Recently posted' },
  { value: 'most_needed', label: 'Most volunteers needed' },
];

export const COMMON_REQUIREMENTS = [
  'Age 18+',
  'Physically fit',
  'Comfortable around dogs',
  'Comfortable around cats',
  'Closed shoes',
  'Own transport',
  'Available weekends',
  'Good with children',
  'Not squeamish',
  'Public speaking',
];

export const categoryLabel = (value) => {
  const found = TASK_CATEGORIES.find(function (c) { return c.value === value; });
  return found ? found.label : value;
};

export const formatTaskDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};