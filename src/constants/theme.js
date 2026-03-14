/**
 * Theme Configuration
 * Color palette, typography, and spacing constants
 */

export const COLORS = {
    // Primary colors (Premium Violet)
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#8B5CF6',

    // Secondary colors (Emerald)
    secondary: '#10B981',
    secondaryDark: '#059669',
    secondaryLight: '#34D399',

    // Difficulty colors
    easy: '#10B981',         // Green
    medium: '#F59E0B',       // Amber
    hard: '#EF4444',         // Red

    // Neutral colors
    background: '#F8FAFC',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Text colors
    text: '#0F172A',
    textSecondary: '#64748B',
    textLight: '#94A3B8',

    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Border and divider
    border: '#E2E8F0',
    divider: '#F1F5F9',

    // Dark mode colors (Deep Slate)
    darkBackground: '#0F172A',
    darkSurface: '#1E293B',
    darkCard: '#1E293B',
    darkText: '#F8FAFC',
    darkTextSecondary: '#94A3B8',
    darkDivider: '#334155',
    darkBorder: '#334155',
};

export const getThemeColors = (isDarkMode) => {
    if (!isDarkMode) return COLORS;

    return {
        ...COLORS,
        background: COLORS.darkBackground,
        surface: COLORS.darkSurface,
        card: COLORS.darkCard,
        text: COLORS.darkText,
        textSecondary: COLORS.darkTextSecondary,
        divider: COLORS.darkDivider,
        border: COLORS.darkBorder,
    };
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
