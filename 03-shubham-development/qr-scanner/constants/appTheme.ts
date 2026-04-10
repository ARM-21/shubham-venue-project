/**
 * Theme configuration aligned with web app
 * Color scheme: Maroon primary + Gold accents
 */

export const AppTheme = {
  // Primary Colors
  colors: {
    // Branding
    maroonPrimary: '#8B0000',
    maroonHover: '#A52A2A',
    goldAccent: '#C0A04C',
    
    // Backgrounds
    lightBg: '#F8F8F8',
    white: '#FFFFFF',
    darkBg: '#221010',
    
    // Text Colors
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    textLight: '#CCCCCC',
    textWhite: '#FFFFFF',
    
    // Status Colors
    success: '#4CAF50',
    error: '#DC3545',
    warning: '#FF9800',
    info: '#2196F3',
    
    // UI Elements
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    divider: '#EEEEEE',
    
    // Scanner Specific
    scannerGreen: '#00CC44',
    focusBlue: '#007AFF',
  },
  
  // Typography
  fonts: {
    familySans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
    familySerif: '"Georgia", "Times New Roman"',
    familyMono: '"Courier New", monospace',
    
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
    },
    
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  
  // Border Radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Opacity
  opacity: {
    disabled: 0.5,
    hover: 0.8,
    focus: 0.9,
    overlay: 0.95,
    subtle: 0.1,
  },
};

// Common style utilities
export const CommonStyles = {
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.lg,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: AppTheme.colors.lightBg,
  },
  
  card: {
    backgroundColor: AppTheme.colors.white,
    borderRadius: AppTheme.radius.lg,
    ...AppTheme.shadows.md,
  },
  
  button: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    fontSize: AppTheme.fonts.sizes.base,
    color: AppTheme.colors.textPrimary,
    backgroundColor: '#fafafa',
  },
};

export default AppTheme;
