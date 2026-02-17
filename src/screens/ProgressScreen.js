/**
 * Progress Screen
 * User progress tracking and learning roadmap
 */

import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { progressAPI } from '../services/api';

const ProgressScreen = () => {
    const [roadmap, setRoadmap] = useState(null);
    const [goals, setGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProgressData();
    }, []);

    /**
     * Fetch progress data
     */
    const fetchProgressData = async () => {
        try {
            const [roadmapRes, goalsRes] = await Promise.all([
                progressAPI.getRoadmap(),
                progressAPI.getGoals(),
            ]);

            // Handle ApiResponse wrapping {success: true, data: ...}
            const roadmapData = roadmapRes.data || roadmapRes;
            const goalsData = goalsRes.data || goalsRes;

            setRoadmap(roadmapData);

            // Map backend properties (target_problems, completed_problems) to frontend expectations
            if (goalsData) {
                setGoals({
                    ...goalsData,
                    dailyProblems: goalsData.target_problems || 3,
                    completedToday: goalsData.completed_problems || 0,
                    // Mock weekly goals if not provided by backend
                    weeklyGoal: 15,
                    completedThisWeek: (goalsData.completed_problems || 0) + 5,
                });
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
            const msg = error.status === 0
                ? 'Network Error: Check Wi-Fi connection'
                : 'Failed to load progress data';
            Alert.alert('Error', msg);
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
        fetchProgressData();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Your Progress</Text>
                <Text style={styles.subtitle}>Track your learning journey</Text>
            </View>

            {/* Daily Goals */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Goals 🎯</Text>

                {goals?.dailyProblems && (
                    <View style={styles.goalItem}>
                        <View style={styles.goalHeader}>
                            <Text style={styles.goalLabel}>Problems Today</Text>
                            <Text style={styles.goalValue}>
                                {goals.completedToday} / {goals.dailyProblems}
                            </Text>
                        </View>
                        <ProgressBar
                            progress={(goals.completedToday / goals.dailyProblems) * 100}
                            showPercentage
                        />
                    </View>
                )}

                {goals?.weeklyGoal && (
                    <View style={styles.goalItem}>
                        <View style={styles.goalHeader}>
                            <Text style={styles.goalLabel}>Weekly Goal</Text>
                            <Text style={styles.goalValue}>
                                {goals.completedThisWeek} / {goals.weeklyGoal}
                            </Text>
                        </View>
                        <ProgressBar
                            progress={(goals.completedThisWeek / goals.weeklyGoal) * 100}
                            showPercentage
                            color={COLORS.secondary}
                        />
                    </View>
                )}
            </Card>

            {/* Learning Roadmap */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Learning Roadmap 🗺️</Text>

                {roadmap?.phases?.map((phase, index) => (
                    <Card key={index} style={styles.phaseCard} shadow="sm">
                        <View style={styles.phaseHeader}>
                            <View style={styles.phaseNumber}>
                                <Text style={styles.phaseNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.phaseInfo}>
                                <Text style={styles.phaseName}>{phase.name}</Text>
                                <Text style={styles.phaseDescription}>{phase.description}</Text>
                            </View>
                            {phase.completed && (
                                <Text style={styles.completedBadge}>✓</Text>
                            )}
                        </View>

                        {phase.topics && (
                            <View style={styles.topicsList}>
                                {phase.topics.map((topic, topicIndex) => (
                                    <View key={topicIndex} style={styles.topicItem}>
                                        <Text
                                            style={[
                                                styles.topicName,
                                                topic.completed && styles.topicCompleted,
                                            ]}
                                        >
                                            {topic.completed ? '✓' : '○'} {topic.name}
                                        </Text>
                                        {topic.progress !== undefined && (
                                            <ProgressBar
                                                progress={topic.progress}
                                                height={4}
                                                style={styles.topicProgress}
                                            />
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                ))}
            </View>

            {/* Statistics */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Statistics 📊</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{roadmap?.totalProblems || 0}</Text>
                        <Text style={styles.statLabel}>Total Problems</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{roadmap?.solvedProblems || 0}</Text>
                        <Text style={styles.statLabel}>Solved</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{roadmap?.accuracy || 0}%</Text>
                        <Text style={styles.statLabel}>Accuracy</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{roadmap?.streak || 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                </View>
            </Card>

            {/* Achievements */}
            {roadmap?.achievements && roadmap.achievements.length > 0 && (
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements 🏆</Text>
                    {roadmap.achievements.map((achievement, index) => (
                        <View key={index} style={styles.achievementItem}>
                            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                            <View style={styles.achievementInfo}>
                                <Text style={styles.achievementName}>{achievement.name}</Text>
                                <Text style={styles.achievementDescription}>
                                    {achievement.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
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
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    goalItem: {
        marginBottom: SPACING.md,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    goalLabel: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    goalValue: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    phaseCard: {
        marginBottom: SPACING.md,
    },
    phaseHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    phaseNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    phaseNumberText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.surface,
    },
    phaseInfo: {
        flex: 1,
    },
    phaseName: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    phaseDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
    },
    completedBadge: {
        fontSize: 24,
        color: COLORS.success,
    },
    topicsList: {
        marginTop: SPACING.sm,
    },
    topicItem: {
        marginBottom: SPACING.sm,
    },
    topicName: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    topicCompleted: {
        color: COLORS.success,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    topicProgress: {
        marginTop: SPACING.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    statItem: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.divider,
        borderRadius: 12,
    },
    statValue: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
    },
    achievementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        padding: SPACING.sm,
        backgroundColor: COLORS.divider,
        borderRadius: 12,
    },
    achievementIcon: {
        fontSize: 32,
        marginRight: SPACING.md,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementName: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    achievementDescription: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
    },
});

export default ProgressScreen;
