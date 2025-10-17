/**
 * PoultryCo Brand Colors
 * Based on brand guidelines and wireframe designs
 */

export const colors = {
  // Primary Brand Colors
  primary: '#2B7A4B',        // PoultryCo Green
  primaryLight: '#3a8d5d',   // Lighter green for gradients
  primaryDark: '#1f5a37',    // Darker green for pressed states
  
  secondary: '#1E3A5F',      // Deep Navy
  secondaryLight: '#2d5280', // Lighter navy
  secondaryDark: '#152940',  // Darker navy
  
  // Accent Colors
  accent: '#E67E22',         // Sunrise Orange
  accentLight: '#f39c12',    // Lighter orange
  accentDark: '#d35400',     // Darker orange
  
  // Status Colors
  success: '#27AE60',        // Trust/Success Green
  warning: '#F39C12',        // Warning Yellow
  error: '#E74C3C',          // Error Red
  info: '#3498DB',           // Info Blue
  
  // Tool Colors
  purple: '#9B59B6',         // Tool Purple
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#999999',
  lightGray: '#E0E0E0',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F8F8',
  backgroundTertiary: '#F0F0F0',
  
  // Surface Colors
  surface: '#F8F8F8',
  surfaceLight: '#FAFAFA',
  surfaceDark: '#E8E8E8',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#D0D0D0',
  
  // Text Colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#CCCCCC',
  textInverse: '#FFFFFF',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Gradient Colors
  gradients: {
    primary: 'linear-gradient(135deg, #2B7A4B 0%, #3a8d5d 100%)',
    business: 'linear-gradient(135deg, #1E3A5F 0%, #2B7A4B 100%)',
    header: 'linear-gradient(135deg, #2B7A4B 0%, #1E3A5F 100%)',
    surface: 'linear-gradient(135deg, #F8F8F8 0%, #E8E8E8 100%)',
  },
  
  // Semantic Colors (for specific use cases)
  verified: '#27AE60',       // Verification badge
  trustBadge: '#27AE60',     // Trust badge
  premium: '#F39C12',        // Premium features
  
  // Chart Colors (for data visualization)
  chart: {
    green: '#2B7A4B',
    blue: '#3498DB',
    orange: '#E67E22',
    purple: '#9B59B6',
    red: '#E74C3C',
    yellow: '#F39C12',
  },
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default colors;

