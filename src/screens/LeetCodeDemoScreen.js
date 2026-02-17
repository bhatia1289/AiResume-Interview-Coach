/**
 * LeetCode API Demo Screen
 * Demonstrates the new LeetCode API integration
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI, progressService } from '../services/api';

const LeetCodeDemoScreen = () => {
    const router = useRouter();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDemoProblems();
    }, []);

    /**
     * Fetch demo problems to test LeetCode API integration
     */
    const fetchDemoProblems = async () => {
        try {
            setLoading(true);
            
            // Test 1: Get problems by topic and difficulty
            console.log('Testing LeetCode API integration...');
            
            // Get Array problems with Easy difficulty
            const arrayProblems = await problemsAPI.getProblemsByTopic('Array', 'easy', 10);
            console.log('Array problems (Easy):', arrayProblems.length);
            
            // Get String problems with Medium difficulty
            const stringProblems = await problemsAPI.getProblemsByTopic('String', 'medium', 10);
            console.log('String problems (Medium):', stringProblems.length);
            
            // Combine problems for demo
            const allProblems = [...arrayProblems, ...stringProblems];
            
            // Test 2: Get specific problem details
            if (allProblems.length > 0) {
                const firstProblem = allProblems[0];
                console.log('First problem details:', {
                    title: firstProblem.title,
                    difficulty: firstProblem.difficulty,
                    isSolved: firstProblem.isSolved,
                    attempts: firstProblem.attempts
                });
            }
            
            // Test 3: Progress tracking
            const userStats = await progressService.getUserStats();
            console.log('User stats:', userStats);
            
            setProblems(allProblems);
            
        } catch (error) {
            console.error('Error testing LeetCode API:', error);
            Alert.alert('API Test Error', error.message || 'Failed to test LeetCode API');
            
            // Fallback: show mock data
            const mockProblems = [
                {
                    id: 'two-sum',
                    title: 'Two Sum',
                    difficulty: 'easy',
                    isSolved: false,
                    attempts: 0,
                    description: 'Find two numbers in array that add up to target',
                    content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
                },
                {
                    id: 'valid-parentheses',
                    title: 'Valid Parentheses',
                    difficulty: 'easy',
                    isSolved: true,
                    attempts: 1,
                    description: 'Check if parentheses are valid',
                    content: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.'
                }
            ];
            setProblems(mockProblems);
            
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Handle problem press - navigate to problem details
     */
    const handleProblemPress = (problem) => {
        router.push({
            pathname: '/problems/[id]',
            params: { 
                id: problem.id,
                title: problem.title,
                difficulty: problem.difficulty
            },
        });
    };

    /**
     * Test progress tracking
     */
    const testProgressTracking = async (problem) => {
        try {
            console.log('Testing progress tracking...');
            
            // Mark problem as attempted
            await problemsAPI.markProblemAttempted(problem.id, 'Array', problem.difficulty);
            console.log('Marked as attempted:', problem.title);
            
            // Mark problem as solved
            await problemsAPI.markProblemSolved(problem.id, 'Array', problem.difficulty);
            console.log('Marked as solved:', problem.title);
            
            // Get updated stats
            const updatedStats = await progressService.getUserStats();
            console.log('Updated stats:', updatedStats);
            
            Alert.alert('Success', 'Progress tracking test completed! Check console for details.');
            
            // Refresh data
            fetchDemoProblems();
            
        } catch (error) {
            console.error('Error testing progress tracking:', error);
            Alert.alert('Progress Test Error', error.message);
        }
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
            shadow="md"
        >
            <View style={styles.problemHeader}>
                <View style={styles.problemInfo}>
                    <Text style={styles.problemTitle}>{item.title}</Text>
                    <Text style={styles.problemDescription} numberOfLines={2}>
                        {item.description || item.content || 'No description available'}
                    </Text>
                </View>
                <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(item.difficulty) }
                ]}>
                    <Text style={styles.difficultyText}>{item.difficulty}</Text>
                </View>
            </View>

            <View style={styles.problemFooter}>
                <View style={styles.statusContainer}>
                    <Text style={[
                        styles.statusText,
                        item.isSolved ? styles.solvedText : styles.unsolvedText
                    ]}>
                        {item.isSolved ? '✅ Solved' : '❌ Not Solved'}
                    </Text>
                    {item.attempts > 0 && (
                        <Text style={styles.attemptsText}>
                            Attempts: {item.attempts}
                        </Text>
                    )}
                </View>
                
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => testProgressTracking(item)}
                >
                    <Text style={styles.testButtonText}>Test Progress</Text>
                </TouchableOpacity>
            </View>
        </Card>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>LeetCode API Demo</Text>
                <Text style={styles.subtitle}>
                    Testing LeetCode API integration and progress tracking
                </Text>
            </View>

            <FlatList
                data={problems}
                renderItem={renderProblem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchDemoProblems} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No problems found</Text>
                        <Text style={styles.emptySubtext}>
                            Pull to refresh or check your internet connection
                        </Text>
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
    header: {
        padding: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '40',
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        lineHeight: TYPOGRAPHY.fontSize.base * 1.4,
    },
    listContent: {
        padding: SPACING.lg,
    },
    problemCard: {
        marginBottom: SPACING.md,
    },
    problemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
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
    problemDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    difficultyBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    difficultyText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.surface,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        textTransform: 'uppercase',
    },
    problemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border + '40',
    },
    statusContainer: {
        flex: 1,
    },
    statusText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        marginBottom: SPACING.xs,
    },
    solvedText: {
        color: COLORS.success,
    },
    unsolvedText: {
        color: COLORS.error,
    },
    attemptsText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.textSecondary,
    },
    testButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 12,
    },
    testButtonText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});

export default LeetCodeDemoScreen;