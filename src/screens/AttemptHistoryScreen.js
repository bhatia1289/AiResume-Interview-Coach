/**
 * Attempt History Screen — Feature 3
 * View all past code submission attempts grouped by problem
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { dsaFeaturesService } from '../services/dsaFeaturesService';
import { formatTimestamp, truncate } from '../utils/dsaHelpers';

const AttemptHistoryScreen = () => {
    const [grouped, setGrouped] = useState([]);
    const [expanded, setExpanded] = useState({});

    useFocusEffect(
        useCallback(() => {
            loadAttempts();
        }, [])
    );

    const loadAttempts = async () => {
        const data = await dsaFeaturesService.getAttempts();
        // Group by slug
        const map = {};
        data.forEach(a => {
            if (!map[a.slug]) map[a.slug] = { slug: a.slug, title: a.title, attempts: [] };
            map[a.slug].attempts.push(a);
        });
        setGrouped(Object.values(map));
    };

    const handleClearAll = () => {
        Alert.alert('Clear History', 'This will permanently delete all attempt history.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear', style: 'destructive', onPress: async () => {
                    await dsaFeaturesService.clearHistory();
                    setGrouped([]);
                }
            },
        ]);
    };

    const toggleExpand = (slug) => {
        setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }));
    };

    const renderAttempt = (attempt) => (
        <View key={attempt.id} style={styles.attemptRow}>
            <MaterialCommunityIcons
                name={attempt.status === 'solved' ? 'check-circle' : 'close-circle'}
                size={16}
                color={attempt.status === 'solved' ? COLORS.success : COLORS.error}
                style={{ marginTop: 2 }}
            />
            <View style={styles.attemptInfo}>
                <View style={styles.attemptMeta}>
                    <Text style={styles.attemptStatus}>
                        {attempt.status === 'solved' ? 'Passed' : 'Failed'}
                    </Text>
                    <Text style={styles.attemptLang}>{attempt.language || 'Python'}</Text>
                    <Text style={styles.attemptTime}>{formatTimestamp(attempt.timestamp)}</Text>
                </View>
                {attempt.feedback ? (
                    <Text style={styles.attemptFeedback} numberOfLines={2}>{truncate(attempt.feedback, 120)}</Text>
                ) : null}
                <Text style={styles.codePreview} numberOfLines={2}>{truncate(attempt.code, 90)}</Text>
            </View>
        </View>
    );

    const renderGroup = ({ item }) => {
        const isOpen = !!expanded[item.slug];
        const passCount = item.attempts.filter(a => a.status === 'solved').length;
        return (
            <View style={styles.groupCard}>
                <TouchableOpacity style={styles.groupHeader} onPress={() => toggleExpand(item.slug)} activeOpacity={0.8}>
                    <View style={styles.groupLeft}>
                        <Text style={styles.groupTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.groupMeta}>
                            {item.attempts.length} attempt{item.attempts.length !== 1 ? 's' : ''} · {passCount} passed
                        </Text>
                    </View>
                    <MaterialCommunityIcons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={COLORS.textSecondary}
                    />
                </TouchableOpacity>
                {isOpen && (
                    <View style={styles.attemptsContainer}>
                        {item.attempts.map(renderAttempt)}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>📝 Attempt History</Text>
                    <Text style={styles.subtitle}>{grouped.length} problem{grouped.length !== 1 ? 's' : ''} attempted</Text>
                </View>
                {grouped.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {grouped.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="history" size={64} color={COLORS.textLight} />
                    <Text style={styles.emptyTitle}>No history yet</Text>
                    <Text style={styles.emptyHint}>Your submission attempts will appear here after you submit a solution.</Text>
                </View>
            ) : (
                <FlatList
                    data={grouped}
                    keyExtractor={(item) => item.slug}
                    renderItem={renderGroup}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    clearBtn: { padding: SPACING.sm },
    clearText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.error, fontWeight: '600' },
    list: { padding: SPACING.md, paddingTop: 0 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
    emptyHint: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
    groupCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
        overflow: 'hidden',
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    groupLeft: { flex: 1 },
    groupTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text },
    groupMeta: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
    attemptsContainer: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: SPACING.md },
    attemptRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    attemptInfo: { flex: 1 },
    attemptMeta: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginBottom: 4 },
    attemptStatus: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '700', color: COLORS.text },
    attemptLang: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.primary, fontWeight: '500' },
    attemptTime: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLight, marginLeft: 'auto' },
    attemptFeedback: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 2 },
    codePreview: { fontSize: 11, color: COLORS.textLight, fontFamily: 'monospace' },
});

export default AttemptHistoryScreen;
