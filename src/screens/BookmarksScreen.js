/**
 * Bookmarks Screen — Feature 2
 * View and manage bookmarked problems
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
import { difficultyColor, formatTimestamp } from '../utils/dsaHelpers';

const BookmarksScreen = () => {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState([]);

    useFocusEffect(
        useCallback(() => {
            loadBookmarks();
        }, [])
    );

    const loadBookmarks = async () => {
        const data = await dsaFeaturesService.getBookmarks();
        setBookmarks(data);
    };

    const handleRemove = (slug) => {
        Alert.alert('Remove Bookmark', 'Remove this problem from bookmarks?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    const updated = await dsaFeaturesService.removeBookmark(slug);
                    setBookmarks(updated);
                }
            },
        ]);
    };

    const handlePress = (item) => {
        router.push({
            pathname: '/problem-detail',
            params: { problemSlug: item.slug, problemTitle: item.title },
        });
    };

    const handleClearAll = () => {
        Alert.alert('Clear All', 'Remove all bookmarks?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear All', style: 'destructive', onPress: async () => {
                    for (const b of bookmarks) {
                        await dsaFeaturesService.removeBookmark(b.slug);
                    }
                    setBookmarks([]);
                }
            },
        ]);
    };

    const renderItem = ({ item }) => {
        const color = difficultyColor(item.difficulty);
        return (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.8}>
                <View style={styles.cardContent}>
                    <MaterialCommunityIcons name="bookmark" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.cardMeta}>{formatTimestamp(item.savedAt)}</Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: color + '22', borderColor: color }]}>
                        <Text style={[styles.diffText, { color }]}>{item.difficulty || 'N/A'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.slug)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="close-circle-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>🔖 Bookmarks</Text>
                    <Text style={styles.subtitle}>{bookmarks.length} saved problem{bookmarks.length !== 1 ? 's' : ''}</Text>
                </View>
                {bookmarks.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {bookmarks.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="bookmark-outline" size={64} color={COLORS.textLight} />
                    <Text style={styles.emptyTitle}>No bookmarks yet</Text>
                    <Text style={styles.emptyHint}>Bookmark problems from the DSA Hub to find them here quickly.</Text>
                </View>
            ) : (
                <FlatList
                    data={bookmarks}
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
    list: { paddingHorizontal: SPACING.md },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyTitle: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
    emptyHint: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text },
    cardMeta: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLight, marginTop: 2 },
    diffBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        marginLeft: SPACING.sm,
    },
    diffText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    removeBtn: { paddingLeft: SPACING.sm },
});

export default BookmarksScreen;
