/**
 * Progress Bar Component
 * Visual progress indicator
 */

import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const ProgressBar = ({
    progress = 0, // 0 to 100
    height = 8,
    color = COLORS.primary,
    backgroundColor = COLORS.divider,
    showPercentage = false,
    style,
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <View style={[styles.container, style]}>
            <View
                style={[
                    styles.track,
                    { height, backgroundColor, borderRadius: height / 2 },
                ]}
            >
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${clampedProgress}%`,
                            backgroundColor: color,
                            borderRadius: height / 2,
                        },
                    ]}
                />
            </View>
            {showPercentage && (
                <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    track: {
        flex: 1,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
    percentage: {
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.textSecondary,
        minWidth: 40,
    },
});

export default ProgressBar;
