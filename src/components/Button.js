/**
 * Custom Button Component
 * Reusable button with different variants
 */

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY, getThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, text
    size = 'medium', // small, medium, large
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}) => {
    const { isDarkMode } = useTheme();
    const colors = getThemeColors(isDarkMode);

    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        (variant === 'primary' || variant === 'secondary') && { color: colors.surface },
        variant === 'outline' && { color: COLORS.primary },
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.surface : COLORS.primary}
                />
            ) : (
                <>
                    {icon && icon}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BORDER_RADIUS.md,
    },

    // Variants
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    text: {
        backgroundColor: 'transparent',
    },

    // Sizes
    small: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    medium: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    large: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
    },

    // Disabled state
    disabled: {
        opacity: 0.5,
    },

    // Text styles
    primaryText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    secondaryText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    outlineText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    textText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },

    // Size text
    smallText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
    },
    mediumText: {
        fontSize: TYPOGRAPHY.fontSize.base,
    },
    largeText: {
        fontSize: TYPOGRAPHY.fontSize.lg,
    },
});

export default Button;
