/**
 * PoultryCo Spacing System
 * Based on wireframe designs
 */

export const spacing = {
  // Base spacing unit (4px)
  unit: 4,
  
  // Spacing scale
  xs: 5,      // 5px
  sm: 10,     // 10px
  md: 15,     // 15px
  lg: 20,     // 20px
  xl: 30,     // 30px
  xxl: 40,    // 40px
  xxxl: 60,   // 60px
  
  // Component-specific spacing
  component: {
    // Padding
    cardPadding: 15,
    sectionPadding: 15,
    screenPadding: 20,
    buttonPadding: 12,
    inputPadding: 10,
    
    // Margins
    cardMargin: 10,
    sectionMargin: 15,
    itemMargin: 8,
    
    // Gaps
    gridGap: 10,
    listGap: 12,
    iconGap: 10,
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    xs: 3,
    sm: 5,
    md: 8,
    lg: 10,
    xl: 15,
    xxl: 20,
    xxxl: 25,
    full: 9999,
  },
  
  // Icon Sizes
  iconSize: {
    tiny: 16,
    small: 20,
    medium: 24,
    large: 32,
    xlarge: 40,
    xxlarge: 48,
  },
  
  // Avatar Sizes
  avatarSize: {
    small: 32,
    medium: 50,
    large: 80,
    xlarge: 120,
  },
  
  // Touch Targets (minimum 44x44 for accessibility)
  touchTarget: {
    min: 44,
    comfortable: 48,
  },
  
  // Layout
  layout: {
    bottomNavHeight: 60,
    headerHeight: 56,
    statusBarHeight: 44,
    tabBarHeight: 48,
  },
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof typeof spacing;

// Helper function to get spacing value
export const getSpacing = (multiplier: number): number => {
  return spacing.unit * multiplier;
};

export default spacing;

