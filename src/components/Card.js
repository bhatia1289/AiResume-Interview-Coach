/**
 * Card Component
 * Reusable card container with shadow
 */

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, getThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const Card = ({
    children,
    onPress,
    style,
    shadow = 'md', // sm, md, lg
    padding = 'md', // sm, md, lg
    ...props
}) => {
    const { isDarkMode } = useTheme();
    const colors = getThemeColors(isDarkMode);
    const Container = onPress ? TouchableOpacity : View;

    const cardStyles = [
        styles.card,
        { backgroundColor: colors.card },
        SHADOWS[shadow],
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        style,
    ];

    return (
        <Container
            style={cardStyles}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            {...props}
        >
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
    },
    paddingSm: {
        padding: SPACING.sm,
    },
    paddingMd: {
        padding: SPACING.md,
    },
    paddingLg: {
        padding: SPACING.lg,
    },
});

export default Card;
