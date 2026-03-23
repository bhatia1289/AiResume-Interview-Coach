/**
 * DifficultyChart Component
 * Animated horizontal bar chart for Easy/Medium/Hard stats
 * No third-party chart library — pure View-based
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const BAR_CONFIG = [
    { key: 'easy', label: 'Easy', color: COLORS.easy },
    { key: 'medium', label: 'Medium', color: COLORS.medium },
    { key: 'hard', label: 'Hard', color: COLORS.hard },
];

const DifficultyChart = ({ easy = 0, medium = 0, hard = 0 }) => {
    const total = easy + medium + hard;
    const animValues = useRef(BAR_CONFIG.map(() => new Animated.Value(0))).current;

    const getPercent = (val) => (total > 0 ? (val / total) * 100 : 0);
    const counts = { easy, medium, hard };

    useEffect(() => {
        Animated.stagger(120,
            animValues.map((anim, i) => {
                const key = BAR_CONFIG[i].key;
                return Animated.timing(anim, {
                    toValue: getPercent(counts[key]),
                    duration: 600,
                    useNativeDriver: false,
                });
            })
        ).start();
    }, [easy, medium, hard]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Difficulty Breakdown</Text>
            {BAR_CONFIG.map(({ key, label, color }, i) => {
                const count = counts[key];
                const pct = getPercent(count).toFixed(0);
                return (
                    <View key={key} style={styles.row}>
                        <Text style={styles.label}>{label}</Text>
                        <View style={styles.trackContainer}>
                            <View style={styles.track}>
                                <Animated.View
                                    style={[
                                        styles.bar,
                                        {
                                            backgroundColor: color,
                                            width: animValues[i].interpolate({
                                                inputRange: [0, 100],
                                                outputRange: ['0%', '100%'],
                                            }),
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={[styles.count, { color }]}>
                            {count} <Text style={styles.pct}>({pct}%)</Text>
                        </Text>
                    </View>
                );
            })}
            <Text style={styles.total}>Total solved: {total}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    label: {
        width: 54,
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    trackContainer: {
        flex: 1,
    },
    track: {
        height: 10,
        backgroundColor: COLORS.divider,
        borderRadius: 5,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 5,
    },
    count: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: '700',
        minWidth: 70,
        textAlign: 'right',
    },
    pct: {
        fontWeight: '400',
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSize.xs,
    },
    total: {
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        textAlign: 'right',
        fontStyle: 'italic',
    },
});

export default DifficultyChart;
