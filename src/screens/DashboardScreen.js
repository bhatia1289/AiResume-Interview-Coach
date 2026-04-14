import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    Animated
} from 'react-native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { COLORS, SPACING, getThemeColors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { progressAPI } from '../services/api';

const DashboardScreen = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const colors = getThemeColors(isDarkMode);
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

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData(false);
        }, [fetchDashboardData])
    );

    useEffect(() => {
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(false);
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const statsAnim = useRef(new Animated.Value(0)).current;
    const activityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                })
            ]),
            Animated.stagger(200, [
                Animated.spring(statsAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.spring(activityAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 50,
                    useNativeDriver: true,
                })
            ])
        ]).start();
    }, [fadeAnim, slideAnim, statsAnim, activityAnim]);

    if (loading) return <LoadingSpinner />;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={COLORS.primary}
                />
            }
        >
            {/* Premium Animated Header */}
            <Animated.View style={[
                styles.premiumHeaderWrap, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
                <View style={styles.premiumHeaderContent}>
                    <View style={styles.avatarContainer}>
                        <Image 
                            source={{ uri: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Sunglasses.png' }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.premiumGreeting, { color: colors.text }]}>
                            Hello, {user?.name?.split(' ')[0]} <Text style={styles.waveEmoji}>👋</Text>
                        </Text>
                        <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>Let's conquer some algorithms! 🚀</Text>
                    </View>
                </View>
                <View style={[styles.premiumHeaderIconBlock, { backgroundColor: isDarkMode ? '#1e1b4b' : '#eef2ff' }]}>
                    <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
                    <View style={styles.notificationBadge} />
                </View>
            </Animated.View>

            {/* Error State */}
            {error && (
                <View style={[styles.errorCard, { backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2' }]}>
                    <Ionicons name="warning" size={20} color={COLORS.error} />
                    <Text style={[styles.errorText, { color: isDarkMode ? '#fca5a5' : COLORS.error }]}>{error}</Text>
                </View>
            )}

            {/* Main Stats Grid */}
            <Animated.View style={[
                styles.statsGrid,
                { 
                    opacity: statsAnim,
                    transform: [{ 
                        translateY: statsAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        }) 
                    }] 
                }
            ]}>
                <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7', borderColor: isDarkMode ? '#334155' : '#FDE68A' }]}>
                    <View style={styles.statIconWrapper}>
                        <Ionicons name="flame" size={24} color="#D97706" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>{dashboardData?.streak || 0}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1E293B' : '#E0F2FE', borderColor: isDarkMode ? '#334155' : '#BAE6FD' }]}>
                    <View style={styles.statIconWrapper}>
                        <Ionicons name="checkmark-circle" size={24} color="#0284C7" />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>{dashboardData?.total_solved || 0}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Problems Solved</Text>
                </View>
            </Animated.View>

            {/* Daily Goal */}
            {/* Daily Goal */}
            <View style={[styles.premiumTargetCard, { backgroundColor: isDarkMode ? '#1e1b4b' : '#eef2ff', borderColor: isDarkMode ? '#3730a3' : '#c7d2fe' }]}>
                <View style={styles.premiumTargetHeader}>
                    <View>
                        <Text style={[styles.premiumTargetTitle, { color: isDarkMode ? '#e0e7ff' : '#312e81' }]}>🎯 Daily Target</Text>
                        <Text style={[styles.premiumTargetSubtitle, { color: isDarkMode ? '#818cf8' : '#4f46e5' }]}>
                            {dashboardData?.today_progress >= (dashboardData?.daily_goal || 3) ? "Awesome job today! 🌟" : "Keep the momentum going! 🚀"}
                        </Text>
                    </View>
                    <View style={[styles.targetScoreBadge, { backgroundColor: isDarkMode ? '#312e81' : '#4f46e5' }]}>
                        <Text style={styles.targetScoreText}>
                            {dashboardData?.today_progress || 0} / {dashboardData?.daily_goal || 3}
                        </Text>
                    </View>
                </View>

                <View style={styles.targetContentRow}>
                    <Image 
                        source={{ uri: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Direct%20Hit.png' }}
                        style={styles.targetMainImage}
                    />
                    <View style={styles.targetProgressWrap}>
                        <ProgressBar
                            progress={((dashboardData?.today_progress || 0) / (dashboardData?.daily_goal || 3)) * 100}
                            height={12}
                        />
                        <Text style={[styles.targetMotivation, { color: isDarkMode ? '#c7d2fe' : '#4338ca' }]}>
                            {dashboardData?.today_progress >= (dashboardData?.daily_goal || 3)
                                ? "You've crushed your goal! 🎉 Take a rest or keep grinding! 💪" 
                                : "You're only a few steps away! 🏃‍♂️ Let's get it done!"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Weak Topics */}
            {dashboardData?.weak_topics?.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Areas to Improve</Text>
                    <View style={styles.weakTopicsGrid}>
                        {dashboardData.weak_topics.map((topic, idx) => (
                            <View key={idx} style={[styles.weakTopicCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1F2', borderColor: isDarkMode ? '#334155' : '#FFE4E6' }]}>
                                <Text style={[styles.weakTopicName, { color: colors.text }]} numberOfLines={1}>{topic.name}</Text>
                                <View style={styles.accuracyBadge}>
                                    <Text style={styles.weakTopicAccuracy}>
                                        {Math.round(topic.accuracy)}% Accuracy
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Recent Activity */}
            <Animated.View style={[
                styles.section,
                {
                    opacity: activityAnim,
                    transform: [{
                        translateX: activityAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0]
                        })
                    }]
                }
            ]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                <View style={[styles.activityContainerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {dashboardData?.recent_activity?.length > 0 ? (
                        dashboardData.recent_activity.map((activity, index) => (
                            <View key={index} style={[
                                styles.activityRow, 
                                { borderBottomWidth: index === dashboardData.recent_activity.length - 1 ? 0 : 1, borderBottomColor: colors.divider }
                            ]}>
                                <View style={[styles.activityIcon, { backgroundColor: activity.status === 'solved' ? '#DCFCE7' : '#FEF9C3' }]}>
                                    <Ionicons 
                                        name={activity.status === 'solved' ? 'checkmark' : 'time'} 
                                        size={18} 
                                        color={activity.status === 'solved' ? '#16A34A' : '#CA8A04'} 
                                    />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityName, { color: colors.text }]} numberOfLines={1}>
                                        {activity.question_id?.split('-').join(' ')}
                                    </Text>
                                    <Text style={[styles.activityDate, { color: colors.textSecondary }]}>
                                        {new Date(activity.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusPill,
                                    { backgroundColor: activity.status === 'solved' ? '#DCFCE7' : '#FEF9C3' }
                                ]}>
                                    <Text style={[
                                        styles.statusPillText,
                                        { color: activity.status === 'solved' ? '#16A34A' : '#CA8A04' }
                                    ]}>
                                        {activity.status === 'solved' ? 'Solved' : 'Attempted'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyActivity}>
                            <Ionicons name="document-text-outline" size={48} color={colors.textLight} />
                            <Text style={[styles.emptyActivityTitle, { color: colors.text }]}>No Recent Activity</Text>
                            <Text style={[styles.emptyActivitySub, { color: colors.textSecondary }]}>Your problem solving history will appear here.</Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg, paddingBottom: 100 },
    premiumHeaderWrap: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.xs
    },
    premiumHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: SPACING.md,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarImage: {
        width: 44,
        height: 44,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        backgroundColor: '#10B981',
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    headerTextContainer: { flex: 1, paddingRight: 8 },
    premiumGreeting: { 
        fontSize: 24, 
        fontWeight: '900', 
        letterSpacing: 0.5,
        marginBottom: 2 
    },
    waveEmoji: {
        fontSize: 22,
    },
    premiumSubtitle: { 
        fontSize: 14, 
        fontWeight: '600', 
        opacity: 0.8 
    },
    premiumHeaderIconBlock: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },

    errorCard: { 
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        gap: 10
    },
    errorText: { fontWeight: '600', fontSize: 14, flex: 1 },

    statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    statCard: { 
        flex: 1, 
        alignItems: 'center', 
        padding: SPACING.lg,
        borderRadius: 24,
        borderWidth: 1,
    },
    statIconWrapper: {
        marginBottom: SPACING.sm,
    },
    statValue: { fontSize: 32, fontWeight: '800', marginBottom: 2 },
    statLabel: { fontSize: 13, fontWeight: '600' },

    premiumTargetCard: { 
        padding: SPACING.lg, 
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: SPACING.xl,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    premiumTargetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    premiumTargetTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
    },
    premiumTargetSubtitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    targetScoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    targetScoreText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    targetContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    targetMainImage: {
        width: 60,
        height: 60,
    },
    targetProgressWrap: {
        flex: 1,
        justifyContent: 'center',
    },
    targetMotivation: {
        fontSize: 12,
        marginTop: SPACING.sm,
        fontWeight: '600',
        lineHeight: 18,
    },

    section: { marginBottom: SPACING.xl },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.md, letterSpacing: 0.2 },

    weakTopicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    weakTopicCard: { 
        flex: 1, 
        padding: SPACING.md, 
        borderRadius: 16, 
        borderWidth: 1,
        minWidth: '45%',
    },
    weakTopicName: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
    accuracyBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#EF4444' + '15',
        borderRadius: 6,
    },
    weakTopicAccuracy: { fontSize: 12, color: '#EF4444', fontWeight: '700' },

    activityContainerCard: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activityInfo: { flex: 1, marginRight: SPACING.sm },
    activityName: { fontSize: 15, fontWeight: '700', marginBottom: 3, textTransform: 'capitalize' },
    activityDate: { fontSize: 12 },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyActivity: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyActivityTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: SPACING.md,
    },
    emptyActivitySub: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    }
});

export default DashboardScreen;
