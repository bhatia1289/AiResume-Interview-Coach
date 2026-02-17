import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

/**
 * EmptyState Component
 * Displays a friendly message when no data is available
 */
const EmptyState = ({
    title = 'No Data Available',
    message = 'There is nothing to show here yet.',
    icon = 'database-off-outline'
}) => {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons
                name={icon}
                size={64}
                color={COLORS.textSecondary}
                style={styles.icon}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING['2xl'],
        marginTop: SPACING['3xl'],
    },
    icon: {
        marginBottom: SPACING.lg,
        opacity: 0.5,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default EmptyState;
