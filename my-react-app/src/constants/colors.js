export const PROGRAM_COLORS = {
    SENG: '#33e9ff',    // Bright cyan blue
    BM: '#aa7dfd',      // Light purple
    IT: '#c1fd7d'       // Light green
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