export const POST_TYPES = [
  { value: 'story', label: 'Story', desc: 'A rescue, adoption, or experience' },
  { value: 'tip', label: 'Tip', desc: 'Practical advice for others' },
  { value: 'question', label: 'Question', desc: 'Ask the community' },
  { value: 'update', label: 'Update', desc: 'News from an organisation' },
];

export const COMMUNITY_SORT = [
  { value: 'newest', label: 'Latest' },
  { value: 'popular', label: 'Most engaged' },
  { value: 'oldest', label: 'Oldest first' },
];

export const SUGGESTED_TAGS = [
  'rescue-story', 'adoption', 'street-dogs', 'cats', 'first-aid',
  'behaviour', 'winter', 'sterilization', 'ngo-update', 'legal',
  'senior-pets', 'recovery', 'care', 'nepal', 'impact',
];

export const typeLabel = (value) => {
  const found = POST_TYPES.find(function (t) { return t.value === value; });
  return found ? found.label : value;
};

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'd ago';
  const months = Math.floor(days / 30);
  if (months < 12) return months + 'mo ago';
  return Math.floor(months / 12) + 'y ago';
};