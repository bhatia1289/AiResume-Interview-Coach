/**
 * Dashboard Screen
 * Home screen showing user progress and stats
 */

import { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { progressAPI } from '../services/api';

const DashboardScreen = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    /**
     * Fetch dashboard data from API
     * Falls back to mock data if API is unavailable
     */
    const fetchDashboardData = async () => {
        try {
            const data = await progressAPI.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            console.log('Using mock data for development...');

            // Use mock data when backend is not available
            setDashboardData(mockDashboardData);

            // Optional: Show a subtle message (comment out in production)
            // Alert.alert('Demo Mode', 'Using sample data. Connect backend for real data.');
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
        fetchDashboardData();
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
            {/* Welcome Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
                <Text style={styles.subtitle}>Ready to practice DSA today?</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <Card style={styles.statCard} shadow="sm">
                    <Text style={styles.statValue}>
                        {dashboardData?.streak || 0} 🔥
                    </Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </Card>

                <Card style={styles.statCard} shadow="sm">
                    <Text style={styles.statValue}>
                        {dashboardData?.totalSolved || 0}
                    </Text>
                    <Text style={styles.statLabel}>Problems Solved</Text>
                </Card>
            </View>

            {/* Today's Goal */}
            <Card style={styles.goalCard}>
                <Text style={styles.sectionTitle}>Today's Goal</Text>
                <View style={styles.goalContent}>
                    <Text style={styles.goalText}>
                        {dashboardData?.todayProgress || 0} / {dashboardData?.dailyGoal || 3} problems
                    </Text>
                    <ProgressBar
                        progress={
                            ((dashboardData?.todayProgress || 0) /
                                (dashboardData?.dailyGoal || 3)) *
                            100
                        }
                        showPercentage
                        style={styles.progressBar}
                    />
                </View>
            </Card>

            {/* Topic Progress */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Topic Progress</Text>
                {dashboardData?.topicProgress?.map((topic) => (
                    <Card key={topic.id} style={styles.topicCard} shadow="sm">
                        <View style={styles.topicHeader}>
                            <Text style={styles.topicIcon}>{topic.icon}</Text>
                            <View style={styles.topicInfo}>
                                <Text style={styles.topicName}>{topic.name}</Text>
                                <Text style={styles.topicStats}>
                                    {topic.solved} / {topic.total} problems
                                </Text>
                            </View>
                        </View>
                        <ProgressBar
                            progress={(topic.solved / topic.total) * 100}
                            color={COLORS.secondary}
                        />
                    </Card>
                ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {dashboardData?.recentActivity?.map((activity, index) => (
                    <Card key={index} style={styles.activityCard} shadow="sm">
                        <View style={styles.activityContent}>
                            <Text style={styles.activityTitle}>{activity.problem}</Text>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: activity.status === 'solved' ? COLORS.success : COLORS.warning },
                            ]}
                        >
                            <Text style={styles.statusText}>
                                {activity.status === 'solved' ? '✓ Solved' : '⏱ Attempted'}
                            </Text>
                        </View>
                    </Card>
                ))}
            </View>
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
    greeting: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    statValue: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
    },
    goalCard: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    goalContent: {
        marginTop: SPACING.sm,
    },
    goalText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    progressBar: {
        marginTop: SPACING.sm,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    topicCard: {
        marginBottom: SPACING.sm,
    },
    topicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    topicIcon: {
        fontSize: 32,
        marginRight: SPACING.md,
    },
    topicInfo: {
        flex: 1,
    },
    topicName: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
    },
    topicStats: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    activityCard: {
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    activityTime: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    statusText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.surface,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
});

export default DashboardScreen;
