export const EVENT_CATEGORIES = [
  { value: 'adoption_fair', label: 'Adoption Fair' },
  { value: 'vaccination_camp', label: 'Vaccination Camp' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];

export const EVENT_SORT = [
  { value: 'soonest', label: 'Starting soonest' },
  { value: 'newest', label: 'Recently posted' },
  { value: 'popular', label: 'Most attended' },
];

export const GUEST_OPTIONS = [1, 2, 3, 4, 5];

export const eventCategoryLabel = (value) => {
  const found = EVENT_CATEGORIES.find(function (c) { return c.value === value; });
  return found ? found.label : value;
};

export const formatEventDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export const formatLongDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};