export const PROGRAM_COLORS = {
  'Team A': '#00BCD4',  // Previously SENG
  'Team B': '#9C27B0',  // Previously BM
  'Team C': '#FF9800',  // Previously IT
  'Team D': '#4CAF50',
  'Team E': '#F44336',
  'Team F': '#3F51B5',
  'Team G': '#E91E63',
  'Team H': '#009688',
  'Team I': '#FFC107',
  'Team J': '#795548',
  'Team K': '#607D8B',
  'Team L': '#8BC34A',
  'Team M': '#CDDC39',
  'Team N': '#673AB7',
  'Team O': '#FF5722',
  'Team P': '#03A9F4',
  'Team Q': '#2196F3',
  'Team R': '#9E9E9E',
  'Team S': '#FFB300',
  'Team T': '#5D4037'
};

export const getAvatarConfig = (userId, program) => {
  // Get initials from userId
  const initials = userId
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Use the program color from PROGRAM_COLORS, or a default color if program doesn't exist
  const backgroundColor = PROGRAM_COLORS[program] || '#9E9E9E'; // Slate gray as default

  return {
    initials,
    backgroundColor
  };
};