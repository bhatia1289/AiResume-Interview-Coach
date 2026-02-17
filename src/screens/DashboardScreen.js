import { useCallback, useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { COLORS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { progressAPI } from '../services/api';

const DashboardScreen = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const res = await progressAPI.getDashboard();
            setDashboardData(res.data || res);
        } catch (err) {
            console.error('Dashboard Error:', err);
            const msg = err.status === 0
                ? 'Network Error: Check if phone and PC are on the same Wi-Fi'
                : (err.message || 'Failed to connect to server');
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                />
            }
        >
            {/* Header section */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0]}! 👋</Text>
                <Text style={styles.subtitle}>Let&apos;s master some algorithms today.</Text>
            </View>

            {/* Error State */}
            {error && (
                <Card style={styles.errorCard} padding="sm">
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                </Card>
            )}

            {/* Main Stats Grid */}
            <View style={styles.statsGrid}>
                <Card style={styles.statCard} shadow="sm">
                    <Text style={styles.statValue}>{dashboardData?.streak || 0} 🔥</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </Card>
                <Card style={styles.statCard} shadow="sm">
                    <Text style={styles.statValue}>{dashboardData?.total_solved || 0}</Text>
                    <Text style={styles.statLabel}>Solved</Text>
                </Card>
            </View>

            {/* Daily Goal & Overall Progress */}
            <Card style={styles.mainProgressCard}>
                <View style={styles.progressRow}>
                    <View style={styles.progressItem}>
                        <Text style={styles.sectionTitle}>Today&apos;s Goal</Text>
                        <Text style={styles.progressValue}>
                            {dashboardData?.today_progress || 0} / {dashboardData?.daily_goal || 3}
                        </Text>
                        <ProgressBar
                            progress={((dashboardData?.today_progress || 0) / (dashboardData?.daily_goal || 3)) * 100}
                            height={10}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.progressItem}>
                        <Text style={styles.sectionTitle}>Total Mastered</Text>
                        <Text style={styles.progressValue}>
                            {Math.round(dashboardData?.completion_percentage || 0)}%
                        </Text>
                        <ProgressBar
                            progress={dashboardData?.completion_percentage || 0}
                            color={COLORS.secondary}
                            height={10}
                        />
                    </View>
                </View>
            </Card>

            {/* Weak Topics - Alert the user */}
            {dashboardData?.weak_topics?.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Focus Areas 🎯</Text>
                    <View style={styles.weakTopicsGrid}>
                        {dashboardData.weak_topics.map((topic, idx) => (
                            <Card key={idx} style={styles.weakTopicCard} padding="sm">
                                <Text style={styles.weakTopicName}>{topic.name}</Text>
                                <Text style={styles.weakTopicAccuracy}>
                                    Accuracy: {Math.round(topic.accuracy)}%
                                </Text>
                            </Card>
                        ))}
                    </View>
                </View>
            )}

            {/* Topic Progress */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Learning Progress</Text>
                </View>

                {dashboardData?.topic_progress?.length > 0 ? (
                    dashboardData.topic_progress.map((topic) => (
                        <Card key={topic.topic_id} style={styles.topicCard} shadow="sm">
                            <View style={styles.topicInfo}>
                                <Text style={styles.topicName}>{topic.name}</Text>
                                <Text style={styles.topicStats}>
                                    {topic.questions_solved} / {topic.total_questions} Solved
                                </Text>
                            </View>
                            <ProgressBar
                                progress={topic.percentage}
                                color={topic.percentage > 70 ? COLORS.success : COLORS.primary}
                            />
                        </Card>
                    ))
                ) : (
                    <EmptyState
                        title="Start Your Journey"
                        message="Pick a topic from the Topics tab to start practicing!"
                    />
                )}
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {dashboardData?.recent_activity?.length > 0 ? (
                    dashboardData.recent_activity.map((activity, index) => (
                        <Card key={index} style={styles.activityCard} padding="sm">
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityName} numberOfLines={1}>
                                    {activity.question_id?.split('-').join(' ')}
                                </Text>
                                <Text style={styles.activityDate}>
                                    {new Date(activity.submitted_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: activity.status === 'solved' ? COLORS.success + '20' : COLORS.warning + '20' }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: activity.status === 'solved' ? COLORS.success : COLORS.warning }
                                ]}>
                                    {activity.status === 'solved' ? '✓ Solved' : '⏱ Tried'}
                                </Text>
                            </View>
                        </Card>
                    ))
                ) : (
                    <EmptyState
                        title="No Recent Activity"
                        message="Start solving problems to see your activity here."
                    />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    header: { marginBottom: SPACING.xl },
    greeting: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary },

    errorCard: { backgroundColor: '#fee2e2', marginBottom: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.error },
    errorText: { color: COLORS.error, fontWeight: '500' },

    statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg },
    statValue: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
    statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },

    mainProgressCard: { marginBottom: SPACING.lg, padding: SPACING.md },
    progressRow: { flexDirection: 'row' },
    progressItem: { flex: 1 },
    progressValue: { fontSize: 18, fontWeight: '700', marginVertical: 8, color: COLORS.text },
    divider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },

    section: { marginBottom: SPACING.xl },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },

    weakTopicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    weakTopicCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ffedd5', flex: 1, minWidth: '45%' },
    weakTopicName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    weakTopicAccuracy: { fontSize: 12, color: COLORS.warning, marginTop: 4 },

    topicCard: { marginBottom: SPACING.md },
    topicInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    topicName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    topicStats: { fontSize: 13, color: COLORS.textSecondary },

    activityCard: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, backgroundColor: '#fff' },
    activityInfo: { flex: 1 },
    activityName: { fontSize: 15, fontWeight: '500', color: COLORS.text, textTransform: 'capitalize' },
    activityDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '600' },
    noActivityText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 10 }
});

export default DashboardScreen;
