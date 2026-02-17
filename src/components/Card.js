/**
 * Card Component
 * Reusable card container with shadow
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const Card = ({
    children,
    onPress,
    style,
    shadow = 'md', // sm, md, lg
    padding = 'md', // sm, md, lg
}) => {
    const Container = onPress ? TouchableOpacity : View;

    const cardStyles = [
        styles.card,
        SHADOWS[shadow],
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        style,
    ];

    return (
        <Container
            style={cardStyles}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
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

export const EmptyState = ({
    icon = '🔍',
    title = 'No Data Found',
    message = 'Try again later or refresh the page.',
    style
}) => (
    <View style={[emptyStyles.container, style]}>
        <Text style={emptyStyles.icon}>{icon}</Text>
        <Text style={emptyStyles.title}>{title}</Text>
        <Text style={emptyStyles.message}>{message}</Text>
    </View>
);

const emptyStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    icon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    message: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});

export default Card;
