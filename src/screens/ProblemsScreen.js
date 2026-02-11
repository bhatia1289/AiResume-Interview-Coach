/**
 * Problems Screen
 * List of problems for a specific topic
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { topicsAPI } from '../services/api';
import { mockProblemsData } from '../utils/mockData';

const ProblemsScreen = () => {
    const router = useRouter();
    const { topicId, topicName } = useLocalSearchParams();

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProblems();
    }, [topicId]);

    /**
     * Fetch problems for the topic
     * Falls back to mock data if API is unavailable
     */
    const fetchProblems = async () => {
        try {
            const data = await topicsAPI.getTopicDetail(topicId);
            setProblems(data.problems || []);
        } catch (error) {
            console.error('Error fetching problems:', error);
            console.log('Using mock problems data for development...');

            // Use mock data when backend is not available
            const mockData = mockProblemsData[topicId];
            setProblems(mockData?.problems || []);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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
            params: { problemId: problem.id },
        });
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
                    <Text style={styles.problemTitle}>{item.title}</Text>
                    {item.solved && (
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
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>{topicName}</Text>
                        <Text style={styles.subtitle}>
                            {problems.length} problem{problems.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No problems available</Text>
                    </View>
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
        padding: SPACING.lg,
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
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
    problemCard: {
        marginBottom: SPACING.md,
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
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    solvedBadge: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.success,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    difficultyBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    difficultyText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.surface,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        textTransform: 'uppercase',
    },
    problemDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['3xl'],
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
});

export default ProblemsScreen;
