/**
 * Problems Screen
 * List of problems for a specific topic with difficulty filters
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';

const DIFFICULTIES = [
    { key: 'all', label: 'All', color: COLORS.primary },
    { key: 'easy', label: 'Easy', color: COLORS.easy },
    { key: 'medium', label: 'Medium', color: COLORS.medium },
    { key: 'hard', label: 'Hard', color: COLORS.hard },
];

const ProblemsScreen = () => {
    const router = useRouter();
    const { topicId, topicName } = useLocalSearchParams();

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');

    useEffect(() => {
        fetchProblems();
    }, [topicId, selectedDifficulty]);

    /**
     * Fetch problems for the topic with difficulty filter
     */
    const fetchProblems = useCallback(async () => {
        if (!topicName) {
            console.error('No topic name provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log(`Fetching problems for topic: ${topicName} with difficulty: ${selectedDifficulty}`);
            
            // Use the problemsAPI to fetch LeetCode problems
            const fetchedProblems = await problemsAPI.getProblemsByTopic(
                topicName,
                selectedDifficulty,
                50 // Limit to 50 problems
            );
            
            console.log(`Fetched ${fetchedProblems.length} problems for ${topicName}`);
            
            // Ensure all problems have unique IDs
            const problemsWithIds = fetchedProblems.map((problem, index) => ({
                ...problem,
                id: problem.id || problem.titleSlug || `problem-${index}`,
            }));
            
            console.log('Problems with IDs:', problemsWithIds.map(p => ({ id: p.id, name: p.name })));
            setProblems(problemsWithIds);
        } catch (error) {
            console.error('Error fetching problems:', error);
            Alert.alert('Error', 'Failed to load problems from LeetCode API');
            setProblems([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [topicName, selectedDifficulty]);

    /**
     * Handle pull to refresh
     */
    const onRefresh = () => {
        setRefreshing(true);
        fetchProblems();
    };

    /**
     * Navigate to problem detail
     */
    const handleProblemPress = (problem) => {
        router.push({
            pathname: '/problem-detail',
            params: { 
                problemId: problem.id,
                problemTitle: problem.name,
                problemSlug: problem.titleSlug || problem.title_slug || problem.id
            },
        });
    };

    /**
     * Handle difficulty filter change
     */
    const handleDifficultyFilter = (difficulty) => {
        console.log(`Filtering problems by difficulty: ${difficulty}`);
        setSelectedDifficulty(difficulty);
    };

    /**
     * Get difficulty color
     */
    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return COLORS.easy;
            case 'medium':
                return COLORS.medium;
            case 'hard':
                return COLORS.hard;
            default:
                return COLORS.textSecondary;
        }
    };

    /**
     * Render difficulty filter buttons
     */
    const renderDifficultyFilters = () => (
        <View style={styles.filterContainer}>
            {DIFFICULTIES.map((difficulty) => (
                <TouchableOpacity
                    key={difficulty.key}
                    style={[
                        styles.filterButton,
                        selectedDifficulty === difficulty.key && styles.filterButtonActive,
                        { borderColor: difficulty.color }
                    ]}
                    onPress={() => handleDifficultyFilter(difficulty.key)}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            selectedDifficulty === difficulty.key && styles.filterButtonTextActive,
                            { color: selectedDifficulty === difficulty.key ? difficulty.color : COLORS.text }
                        ]}
                    >
                        {difficulty.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    /**
     * Render problem card
     */
    const renderProblem = ({ item }) => (
        <Card
            onPress={() => handleProblemPress(item)}
            style={styles.problemCard}
            shadow="sm"
        >
            <View style={styles.problemHeader}>
                <View style={styles.problemInfo}>
                    <Text style={styles.problemTitle}>{item.name}</Text>
                    {item.isSolved && (
                        <Text style={styles.solvedBadge}>✓ Solved</Text>
                    )}
                </View>
                <View
                    style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(item.difficulty) },
                    ]}
                >
                    <Text style={styles.difficultyText}>{item.difficulty}</Text>
                </View>
            </View>

            {item.description && (
                <Text style={styles.problemDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            {item.attempts > 0 && (
                <Text style={styles.attemptsText}>
                    Attempts: {item.attempts}
                </Text>
            )}
        </Card>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={problems}
                renderItem={renderProblem}
                keyExtractor={(item, index) => item.id || item.titleSlug || item.title_slug || `problem-${index}`}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    <View>
                        <View style={styles.header}>
                            <Text style={styles.title}>{topicName}</Text>
                            <Text style={styles.subtitle}>
                                {problems.length} problem{problems.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                        {renderDifficultyFilters()}
                    </View>
                }
                ListEmptyComponent={
                    <EmptyState
                        message={`No ${selectedDifficulty === 'all' ? '' : selectedDifficulty + ' '}problems found for ${topicName}`}
                        icon="book-open-outline"
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        padding: SPACING.md,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    filterButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        minWidth: 60,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary + '10',
        borderWidth: 2,
    },
    filterButtonText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.text,
    },
    filterButtonTextActive: {
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    problemCard: {
        marginBottom: SPACING.md,
        padding: SPACING.md,
    },
    problemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    problemInfo: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    problemTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    solvedBadge: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.success,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    difficultyBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
        textTransform: 'capitalize',
    },
    problemDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.sm,
    },
    attemptsText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
});

export default ProblemsScreen;