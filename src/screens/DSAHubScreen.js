/**
 * DSA Hub Screen — Premium UI with Dark Mode
 * Central entry point for all DSA features
 */

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DifficultyChart from '../components/DifficultyChart';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, getThemeColors } from '../constants/theme';
import { progressService } from '../services/progressService';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
    { id: 'search',       emoji: '🔍', name: 'Search',         description: 'Find by keyword',        route: '/search',         accent: '#3B82F6' },
    { id: 'bookmarks',    emoji: '🔖', name: 'Bookmarks',      description: 'Saved problems',          route: '/bookmarks',      accent: '#8B5CF6' },
    { id: 'history',      emoji: '📝', name: 'History',        description: 'Past submissions',        route: '/attempt-history',accent: '#10B981' },
    { id: 'retry',        emoji: '🔁', name: 'Retry List',     description: 'Wrong submissions',       route: '/retry',          accent: '#EF4444' },
    { id: 'interview',    emoji: '💬', name: 'AI Interview',   description: 'Mock interview AI',       route: '/interview-mode', accent: '#7C3AED' },
    { id: 'concepts',     emoji: '📖', name: 'Concept Cards',  description: '20 DSA flashcards',       route: '/concept-cards',  accent: '#EC4899' },
    { id: 'speed',        emoji: '⏱️', name: 'Speed Challenge','description': 'Race the clock',        route: '/speed-challenge',accent: '#F97316' },
    { id: 'testcase',     emoji: '🧪', name: 'Test Runner',    description: 'Custom test cases',       route: '/test-case',      accent: '#06B6D4' },
];

const DSAHubScreen = () => {
    const router = useRouter();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const colors = getThemeColors(isDarkMode);
    const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, total: 0 });

    // Animate each card on mount
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useFocusEffect(
        useCallback(() => {
            // Reset & run entrance animation
            fadeAnim.setValue(0);
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
            ]).start();
            loadStats();
        }, [isDarkMode])
    );

    const loadStats = async () => {
        try {
            const userStats = await progressService.getUserStats();
            const b = userStats.difficultyBreakdown || {};
            setStats({
                easy: b.easy?.solved || 0,
                medium: b.medium?.solved || 0,
                hard: b.hard?.solved || 0,
                total: userStats.totalSolved || 0,
            });
        } catch { /* silently fail */ }
    };

    const renderFeature = ({ item, index }) => (
        <FeatureCard
            item={item}
            index={index}
            isDarkMode={isDarkMode}
            colors={colors}
            onPress={() => router.push(item.route)}
        />
    );

    const bg1 = isDarkMode ? '#1a1040' : '#EEE9FF';
    const bg2 = isDarkMode ? '#0a1628' : '#E0EEFF';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={FEATURES}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Hero Header */}
                        <View style={[styles.heroCard, { backgroundColor: isDarkMode ? '#1E1B4B' : COLORS.primaryDark }]}>
                            {/* Decorative blobs */}
                            <View style={[styles.blob1, { backgroundColor: isDarkMode ? '#312e81' : '#7C3AED' }]} />
                            <View style={[styles.blob2, { backgroundColor: isDarkMode ? '#4338ca' : '#8B5CF6' }]} />

                            {/* Dark mode toggle */}
                            <View style={styles.heroTopRow}>
                                <View style={styles.heroLabel}>
                                    <MaterialCommunityIcons name="flask" size={20} color="rgba(255,255,255,0.85)" />
                                    <Text style={styles.heroLabelText}>DSA Tools</Text>
                                </View>
                                <View style={styles.themeToggleRow}>
                                    <MaterialCommunityIcons
                                        name={isDarkMode ? 'moon-waning-crescent' : 'white-balance-sunny'}
                                        size={16}
                                        color="rgba(255,255,255,0.75)"
                                    />
                                    <Switch
                                        value={isDarkMode}
                                        onValueChange={toggleDarkMode}
                                        thumbColor={isDarkMode ? COLORS.primaryLight : '#fff'}
                                        trackColor={{ false: 'rgba(255,255,255,0.25)', true: 'rgba(139,92,246,0.7)' }}
                                        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                                    />
                                </View>
                            </View>

                            <Text style={styles.heroTitle}>Your Practice{'\n'}Toolkit 🛠️</Text>
                            <Text style={styles.heroSubtitle}>
                                {stats.total} problems solved · {FEATURES.length} tools available
                            </Text>

                            {/* Pill stats */}
                            <View style={styles.pillRow}>
                                {[
                                    { label: 'Easy', val: stats.easy, color: COLORS.easy },
                                    { label: 'Med', val: stats.medium, color: COLORS.medium },
                                    { label: 'Hard', val: stats.hard, color: COLORS.hard },
                                ].map(p => (
                                    <View key={p.label} style={styles.pill}>
                                        <View style={[styles.pillDot, { backgroundColor: p.color }]} />
                                        <Text style={styles.pillLabel}>{p.label}</Text>
                                        <Text style={styles.pillVal}>{p.val}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Difficulty Chart */}
                        <View style={[styles.chartWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <DifficultyChart easy={stats.easy} medium={stats.medium} hard={stats.hard} />
                        </View>

                        {/* Section heading */}
                        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>ALL FEATURES</Text>
                    </Animated.View>
                }
                renderItem={renderFeature}
            />
        </View>
    );
};

/* ─────────────────────────────────────────
   Feature Card — individual animated card
───────────────────────────────────────── */
const FeatureCard = ({ item, index, isDarkMode, colors, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 5 }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();

    return (
        <Animated.View style={[styles.cardOuter, { transform: [{ scale }], flex: 1 }]}>
            <TouchableOpacity
                style={[
                    styles.featureCard,
                    {
                        backgroundColor: isDarkMode ? '#1E293B' : COLORS.surface,
                        borderColor: isDarkMode ? item.accent + '44' : item.accent + '22',
                        borderTopColor: item.accent,
                    }
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {/* Glow background */}
                <View style={[styles.cardGlow, { backgroundColor: item.accent + (isDarkMode ? '18' : '12') }]} />

                {/* Icon */}
                <View style={[styles.iconCircle, { backgroundColor: item.accent + '22' }]}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                </View>

                <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.description}
                </Text>

                {/* Arrow */}
                <View style={[styles.arrowBadge, { backgroundColor: item.accent + '18' }]}>
                    <MaterialCommunityIcons name="arrow-right" size={12} color={item.accent} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        paddingBottom: 32,
    },

    /* ── Hero ── */
    heroCard: {
        marginBottom: SPACING.md,
        padding: SPACING.lg,
        paddingTop: SPACING.xl,
        overflow: 'hidden',
    },
    blob1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        top: -60,
        right: -50,
        opacity: 0.35,
    },
    blob2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        bottom: -40,
        left: -30,
        opacity: 0.25,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    heroLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 20,
    },
    heroLabelText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    themeToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: 20,
    },
    heroTitle: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 36,
        marginBottom: SPACING.sm,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: 'rgba(255,255,255,0.65)',
        marginBottom: SPACING.md,
        fontWeight: '500',
    },
    pillRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.14)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: 20,
    },
    pillDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    pillLabel: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    pillVal: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: '#FFFFFF',
        fontWeight: '800',
    },

    /* ── Chart ── */
    chartWrapper: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        ...SHADOWS.md,
    },

    /* ── Section heading ── */
    sectionHeading: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },

    /* ── Feature grid ── */
    row: {
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    cardOuter: {},
    featureCard: {
        borderRadius: 20,
        padding: SPACING.md,
        borderWidth: 1,
        borderTopWidth: 3,
        minHeight: 120,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    cardGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    emoji: {
        fontSize: 24,
    },
    cardName: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: '800',
        marginBottom: 3,
        letterSpacing: 0.1,
    },
    cardDesc: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        lineHeight: 16,
        flex: 1,
    },
    arrowBadge: {
        alignSelf: 'flex-end',
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
});

export default DSAHubScreen;
