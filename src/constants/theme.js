/**
 * Theme Configuration
 * Color palette, typography, and spacing constants
 */

export const COLORS = {
    // Primary colors
    primary: '#6366F1',      // Indigo
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',

    // Secondary colors
    secondary: '#10B981',    // Green
    secondaryDark: '#059669',
    secondaryLight: '#34D399',

    // Difficulty colors
    easy: '#10B981',         // Green
    medium: '#F59E0B',       // Amber
    hard: '#EF4444',         // Red

    // Neutral colors
    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Border and divider
    border: '#E5E7EB',
    divider: '#F3F4F6',

    // Dark mode (optional for future)
    darkBackground: '#111827',
    darkSurface: '#1F2937',
    darkText: '#F9FAFB',
};

export const TYPOGRAPHY = {
    // Font families
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // Font weights
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
};
