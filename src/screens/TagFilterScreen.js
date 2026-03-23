/**
 * Tag Filter Screen — Feature 4
 * Filter problems by multiple DSA tags / topic names
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TagFilter from '../components/TagFilter';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';
import { difficultyColor } from '../utils/dsaHelpers';

const ALL_TAGS = [
    'Array', 'String', 'Linked List', 'Binary Tree', 'Graph',
    'Hash Map', 'Stack', 'Queue', 'Heap', 'Trie',
    'Dynamic Programming', 'Backtracking', 'Greedy', 'Binary Search',
    'Two Pointers', 'Sliding Window', 'Union Find', 'Sorting', 'Math',
];

const TagFilterScreen = () => {
    const router = useRouter();
    const [selectedTags, setSelectedTags] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    useEffect(() => {
        if (selectedTags.length === 0) {
            setResults([]);
            return;
        }
        fetchProblems();
    }, [selectedTags]);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            // Fetch for the first selected tag and merge results
            const firstTag = selectedTags[0];
            const data = await problemsAPI.getProblemsByTopic(firstTag, 'all', 40);
            // If multiple tags selected, filter for problems that have ALL selected tags in their topicTags
            let filtered = data;
            if (selectedTags.length > 1) {
                filtered = data.filter(p => {
                    const tags = (p.topicTags || []).map(t => (t.name || t).toLowerCase());
                    return selectedTags.every(sel => tags.includes(sel.toLowerCase()));
                });
            }
            setResults(filtered);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProblemPress = (problem) => {
        router.push({
            pathname: '/problem-detail',
            params: {
                problemId: problem.id,
                problemTitle: problem.name,
                problemSlug: problem.titleSlug || problem.id,
            },
        });
    };

    const renderItem = ({ item }) => {
        const color = difficultyColor(item.difficulty);
        return (
            <TouchableOpacity style={styles.card} onPress={() => handleProblemPress(item)} activeOpacity={0.8}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    {item.isSolved && <Text style={styles.solvedBadge}>✓ Solved</Text>}
                </View>
                <View style={[styles.diffBadge, { backgroundColor: color + '22', borderColor: color }]}>
                    <Text style={[styles.diffText, { color }]}>{item.difficulty}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🏷️ Tag Filter</Text>
                <Text style={styles.subtitle}>Select tags to filter problems</Text>
            </View>

            <TagFilter tags={ALL_TAGS} selectedTags={selectedTags} onToggle={toggleTag} />

            {selectedTags.length > 0 && (
                <View style={styles.selectionRow}>
                    <Text style={styles.selectionText}>
                        Filtering by: {selectedTags.join(', ')}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedTags([])}>
                        <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            )}

            {!loading && selectedTags.length === 0 && (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="tag-multiple-outline" size={60} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>Select one or more tags above</Text>
                </View>
            )}

            {!loading && selectedTags.length > 0 && results.length === 0 && (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="emoticon-sad-outline" size={52} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>No problems found for selected tags</Text>
                </View>
            )}

            {!loading && results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(item, i) => item.id || String(i)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <Text style={styles.resultCount}>{results.length} problem{results.length !== 1 ? 's' : ''}</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg, paddingBottom: SPACING.sm },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    selectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    selectionText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, flex: 1 },
    clearText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.error, fontWeight: '600', paddingLeft: SPACING.sm },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    emptyText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, marginTop: SPACING.md, textAlign: 'center' },
    list: { padding: SPACING.md, paddingTop: 0 },
    resultCount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    cardLeft: { flex: 1, marginRight: SPACING.sm },
    cardTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text },
    solvedBadge: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.success, fontWeight: '700', marginTop: 3 },
    diffBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
    diffText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
});

export default TagFilterScreen;
