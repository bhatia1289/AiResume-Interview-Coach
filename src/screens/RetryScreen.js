/**
 * Retry Screen — Feature 6
 * Shows a curated list of problems the user got wrong so they can retry
 */

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { dsaFeaturesService } from '../services/dsaFeaturesService';
import { difficultyColor, formatTimestamp, truncate } from '../utils/dsaHelpers';

const RetryScreen = () => {
    const router = useRouter();
    const [wrongList, setWrongList] = useState([]);

    useFocusEffect(
        useCallback(() => {
            loadList();
        }, [])
    );

    const loadList = async () => {
        const data = await dsaFeaturesService.getWrongSubmissions();
        setWrongList(data);
    };

    const handleRetry = (item) => {
        router.push({
            pathname: '/problem-detail',
            params: { problemSlug: item.slug, problemTitle: item.title },
        });
    };

    const handleDismiss = (slug) => {
        Alert.alert('Dismiss', 'Remove this problem from the retry list?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Dismiss', style: 'destructive', onPress: async () => {
                    const updated = await dsaFeaturesService.removeWrongSubmission(slug);
                    setWrongList(updated);
                }
            },
        ]);
    };

    const renderItem = ({ item }) => {
        const color = difficultyColor(item.difficulty);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.error} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardMeta}>{formatTimestamp(item.updatedAt)}</Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: color + '22', borderColor: color }]}>
                        <Text style={[styles.diffText, { color }]}>{item.difficulty || 'N/A'}</Text>
                    </View>
                </View>
                {item.feedback && (
                    <View style={styles.feedbackBox}>
                        <MaterialCommunityIcons name="robot-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.feedbackText} numberOfLines={2}>{truncate(item.feedback, 130)}</Text>
                    </View>
                )}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => handleRetry(item)} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dismissBtn} onPress={() => handleDismiss(item.slug)} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="check" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🔁 Retry List</Text>
                <Text style={styles.subtitle}>{wrongList.length} problem{wrongList.length !== 1 ? 's' : ''} to revisit</Text>
            </View>

            {wrongList.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="check-decagram" size={64} color={COLORS.success} />
                    <Text style={styles.emptyTitle}>All clear! 🎉</Text>
                    <Text style={styles.emptyHint}>Problems you get wrong will appear here for retry practice.</Text>
                </View>
            ) : (
                <FlatList
                    data={wrongList}
                    keyExtractor={(item) => item.slug}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    list: { padding: SPACING.md, paddingTop: 0 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
    emptyHint: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text },
    cardMeta: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLight, marginTop: 2 },
    diffBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
    diffText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    feedbackBox: {
        flexDirection: 'row',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary + '10',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
        alignItems: 'flex-start',
    },
    feedbackText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textSecondary, fontStyle: 'italic' },
    actions: { flexDirection: 'row', gap: SPACING.sm },
    retryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.sm,
    },
    retryText: { color: '#fff', fontWeight: '700', fontSize: TYPOGRAPHY.fontSize.sm },
    dismissBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.divider,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    dismissText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: TYPOGRAPHY.fontSize.sm },
});

export default RetryScreen;
