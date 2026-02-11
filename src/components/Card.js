/**
 * Card Component
 * Reusable card container with shadow
 */

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '../constants/theme';

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

export default Card;
