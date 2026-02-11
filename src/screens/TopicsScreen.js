/**
 * Topics Screen
 * List of all DSA topics
 */

import { useRouter } from 'expo-router';
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
import { mockTopicsData } from '../utils/mockData';

const TopicsScreen = () => {
    const router = useRouter();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    /**
     * Fetch topics from API
     * Falls back to mock data if API is unavailable
     */
    const fetchTopics = async () => {
        try {
            const data = await topicsAPI.getTopics();
            setTopics(data);
        } catch (error) {
            console.error('Error fetching topics:', error);
            console.log('Using mock topics data for development...');

            // Use mock data when backend is not available
            setTopics(mockTopicsData);
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
        fetchTopics();
    };

    /**
     * Navigate to problems screen
     */
    const handleTopicPress = (topic) => {
        router.push({
            pathname: '/problems',
            params: { topicId: topic.id, topicName: topic.name },
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
     * Render topic card
     */
    const renderTopic = ({ item }) => (
        <Card
            onPress={() => handleTopicPress(item)}
            style={styles.topicCard}
            shadow="md"
        >
            <View style={styles.topicHeader}>
                <Text style={styles.topicIcon}>{item.icon}</Text>
                <View style={styles.topicInfo}>
                    <Text style={styles.topicName}>{item.name}</Text>
                    <Text style={styles.topicDescription}>{item.description}</Text>
                </View>
            </View>

            <View style={styles.topicFooter}>
                <View style={styles.problemCount}>
                    <Text style={styles.problemCountText}>
                        {item.problemsCount} problems
                    </Text>
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

            {item.progress !== undefined && (
                <View style={styles.progressContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${item.progress}%` },
                        ]}
                    />
                </View>
            )}
        </Card>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={topics}
                renderItem={renderTopic}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>DSA Topics</Text>
                        <Text style={styles.subtitle}>
                            Choose a topic to start practicing
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
    topicCard: {
        marginBottom: SPACING.md,
    },
    topicHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    topicIcon: {
        fontSize: 40,
        marginRight: SPACING.md,
    },
    topicInfo: {
        flex: 1,
    },
    topicName: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    topicDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    topicFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    problemCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    problemCountText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
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
    progressContainer: {
        height: 4,
        backgroundColor: COLORS.divider,
        borderRadius: 2,
        marginTop: SPACING.md,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
});

export default TopicsScreen;
