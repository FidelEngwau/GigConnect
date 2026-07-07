// Central helper so redirects after login/register stay consistent.
export const dashboardFor = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'professional') return '/professional';
  if (role === 'graduate') return '/graduate';
  return '/gigs';
};

// Convert database role values into user-friendly labels.
export const roleLabel = (role) => {
  if (role === 'graduate') return 'Graduate';
  if (role === 'professional') return 'Professional';
  if (role === 'admin') return 'Admin';
  return role;
};
