import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date, pattern = 'MMM dd, yyyy hh:mm a') => {
  if (!date) return '-';
  const d = new Date(date);
  return format(d, pattern);
};

export const formatRelative = (date) => {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export default formatDate;
