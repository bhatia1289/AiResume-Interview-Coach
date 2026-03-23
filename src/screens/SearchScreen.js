/**
 * Search Screen — Feature 1
 * Search for DSA problems by keyword
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';
import { difficultyColor } from '../utils/dsaHelpers';

const SearchScreen = () => {
    const router = useRouter();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [lastQuery, setLastQuery] = useState('');

    const handleSearch = async (query) => {
        setLastQuery(query);
        if (!query || query.length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            // Search via topic API using query as topic keyword
            const data = await problemsAPI.getProblemsByTopic(query, 'all', 30);
            setResults(data || []);
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
                    <Text style={styles.problemTitle} numberOfLines={1}>{item.name}</Text>
                    {item.isSolved && (
                        <Text style={styles.solvedBadge}>✓ Solved</Text>
                    )}
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
                <Text style={styles.title}>🔍 Search Problems</Text>
                <Text style={styles.subtitle}>Find problems by topic keyword</Text>
            </View>
            <View style={styles.searchWrapper}>
                <SearchBar onSearch={handleSearch} placeholder="e.g. Array, Two Sum, Graph…" />
            </View>

            {loading && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Searching…</Text>
                </View>
            )}

            {!loading && searched && results.length === 0 && (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="file-search-outline" size={52} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>No problems found for "{lastQuery}"</Text>
                    <Text style={styles.emptyHint}>Try a broader term like "Array" or "Graph"</Text>
                </View>
            )}

            {!loading && !searched && (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="magnify" size={60} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>Type to search problems</Text>
                </View>
            )}

            {!loading && results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(item, i) => item.id || String(i)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <Text style={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''} for "{lastQuery}"</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg, paddingBottom: 0 },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 4 },
    searchWrapper: { padding: SPACING.md },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
    emptyText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.text, marginTop: SPACING.md, textAlign: 'center' },
    emptyHint: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
    list: { padding: SPACING.md, paddingTop: 0 },
    resultsCount: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
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
    problemTitle: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text },
    solvedBadge: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.success, fontWeight: '700', marginTop: 3 },
    diffBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
    },
    diffText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
});

export default SearchScreen;
