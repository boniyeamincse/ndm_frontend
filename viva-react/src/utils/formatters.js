export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(date));
};

export const formatMemberId = (id) => {
  if (!id) return '';
  return `NDM-SW-\${id}`;
};
