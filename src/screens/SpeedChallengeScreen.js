/**
 * Speed Challenge Screen — Feature 9
 * Timed challenge mode: 5 random problems, race the clock
 */

import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';
import { difficultyColor, formatDuration, shuffleArray } from '../utils/dsaHelpers';

const DIFFICULTIES = [
    { key: 'easy', label: 'Easy 😌', color: COLORS.easy, time: 5 * 60 },
    { key: 'medium', label: 'Medium 🔥', color: COLORS.medium, time: 10 * 60 },
    { key: 'hard', label: 'Hard 💀', color: COLORS.hard, time: 20 * 60 },
];

const SpeedChallengeScreen = () => {
    const router = useRouter();
    const [phase, setPhase] = useState('setup'); // setup | challenge | result
    const [difficulty, setDifficulty] = useState(null);
    const [problems, setProblems] = useState([]);
    const [statuses, setStatuses] = useState({}); // slug -> 'done' | 'skip'
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);
    const startTime = useRef(null);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startChallenge = async () => {
        if (!difficulty) {
            Alert.alert('Select Difficulty', 'Please choose a difficulty before starting.');
            return;
        }
        setLoading(true);
        try {
            const data = await problemsAPI.getProblemsByTopic(
                ['Array', 'String', 'Linked List', 'Binary Tree', 'Graph'][Math.floor(Math.random() * 5)],
                difficulty.key,
                20
            );
            const picked = shuffleArray(data).slice(0, 5);
            if (picked.length === 0) throw new Error('No problems found');
            setProblems(picked);
            setStatuses({});
            setTimeLeft(difficulty.time);
            setElapsed(0);
            startTime.current = Date.now();
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
                        setPhase('result');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setPhase('challenge');
        } catch {
            Alert.alert('Error', 'Could not load problems. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const markStatus = (slug, status) => {
        const updated = { ...statuses, [slug]: status };
        setStatuses(updated);
        // Auto-finish if all problems resolved
        if (Object.keys(updated).length === problems.length) {
            clearInterval(timerRef.current);
            setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
            setPhase('result');
        }
    };

    const doneCount = Object.values(statuses).filter(s => s === 'done').length;
    const score = problems.length > 0 ? Math.round((doneCount / problems.length) * 100) : 0;

    const renderProblem = ({ item, index }) => {
        const status = statuses[item.id || item.titleSlug];
        const color = difficultyColor(item.difficulty);
        return (
            <View style={[styles.problemCard, status === 'done' && styles.cardDone, status === 'skip' && styles.cardSkip]}>
                <TouchableOpacity 
                    style={styles.problemLeft} 
                    onPress={() => router.push({ pathname: '/problem-detail', params: { problemSlug: item.titleSlug || item.id, fromChallenge: '1' } })}
                    activeOpacity={0.7}
                >
                    <Text style={styles.problemNum}>{index + 1}</Text>
                    <View style={styles.problemInfo}>
                        <Text style={styles.problemTitle} numberOfLines={1}>{item.name}</Text>
                        <View style={[styles.diffBadge, { backgroundColor: color + '22', borderColor: color }]}>
                            <Text style={[styles.diffText, { color }]}>{item.difficulty}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                {!status && (
                    <View style={styles.actionBtns}>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => markStatus(item.id || item.titleSlug, 'done')} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="check" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.skipBtn} onPress={() => markStatus(item.id || item.titleSlug, 'skip')} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="skip-next" size={16} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}
                {status === 'done' && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />}
                {status === 'skip' && <MaterialCommunityIcons name="debug-step-over" size={24} color={COLORS.textLight} />}
            </View>
        );
    };

    if (phase === 'setup') {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>⏱️ Speed Challenge</Text>
                    <Text style={styles.subtitle}>Solve 5 random problems before the clock runs out</Text>
                </View>
                <View style={styles.setup}>
                    <Text style={styles.sectionLabel}>Choose Difficulty:</Text>
                    {DIFFICULTIES.map(d => (
                        <TouchableOpacity
                            key={d.key}
                            style={[styles.diffCard, difficulty?.key === d.key && { borderColor: d.color, borderWidth: 2 }]}
                            onPress={() => setDifficulty(d)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.diffCardLabel, { color: d.color }]}>{d.label}</Text>
                            <Text style={styles.diffCardTime}>⏱ {formatDuration(d.time)}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={[styles.startBtn, loading && styles.startBtnDisabled]} onPress={startChallenge} disabled={loading} activeOpacity={0.85}>
                        {loading ? <ActivityIndicator color="#fff" /> : <><MaterialCommunityIcons name="lightning-bolt" size={20} color="#fff" /><Text style={styles.startBtnText}>Start Challenge!</Text></>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (phase === 'challenge') {
        const urgentColor = timeLeft < 60 ? COLORS.error : COLORS.text;
        return (
            <View style={styles.container}>
                <View style={[styles.timerBar, { backgroundColor: timeLeft < 60 ? COLORS.error + '11' : COLORS.surface }]}>
                    <MaterialCommunityIcons name="clock-fast" size={20} color={urgentColor} />
                    <Text style={[styles.timerText, { color: urgentColor }]}>{formatDuration(timeLeft)}</Text>
                    <Text style={styles.timerSub}>{doneCount}/{problems.length} done</Text>
                </View>
                <FlatList
                    data={problems}
                    keyExtractor={(item, i) => item.id || String(i)}
                    renderItem={renderProblem}
                    contentContainerStyle={styles.list}
                />
            </View>
        );
    }

    if (phase === 'result') {
        return (
            <View style={styles.container}>
                <View style={styles.resultContainer}>
                    <Text style={styles.resultEmoji}>{score >= 80 ? '🏆' : score >= 50 ? '🎯' : '💪'}</Text>
                    <Text style={styles.resultTitle}>Challenge Complete!</Text>
                    <View style={styles.resultStatsRow}>
                        <View style={styles.resultStat}>
                            <Text style={styles.statValue}>{doneCount}/{problems.length}</Text>
                            <Text style={styles.statLabel}>Solved</Text>
                        </View>
                        <View style={styles.resultStat}>
                            <Text style={styles.statValue}>{formatDuration(elapsed)}</Text>
                            <Text style={styles.statLabel}>Time Taken</Text>
                        </View>
                        <View style={styles.resultStat}>
                            <Text style={[styles.statValue, { color: score >= 80 ? COLORS.success : score >= 50 ? COLORS.warning : COLORS.error }]}>{score}%</Text>
                            <Text style={styles.statLabel}>Score</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.startBtn} onPress={() => { setPhase('setup'); setDifficulty(null); }} activeOpacity={0.85}>
                        <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
                        <Text style={styles.startBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    setup: { padding: SPACING.lg, paddingTop: 0 },
    sectionLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
    diffCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    diffCardLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '700' },
    diffCardTime: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: SPACING.md,
        marginTop: SPACING.lg,
        ...SHADOWS.md,
    },
    startBtnDisabled: { opacity: 0.6 },
    startBtnText: { color: '#fff', fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '700' },
    timerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    timerText: { fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: '700', fontFamily: 'monospace', flex: 1 },
    timerSub: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary },
    list: { padding: SPACING.md },
    problemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    cardDone: { borderLeftWidth: 3, borderLeftColor: COLORS.success },
    cardSkip: { borderLeftWidth: 3, borderLeftColor: COLORS.textLight, opacity: 0.7 },
    problemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    problemNum: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: '800', color: COLORS.primary, width: 24 },
    problemInfo: { flex: 1 },
    problemTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    diffBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
    diffText: { fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
    actionBtns: { flexDirection: 'row', gap: SPACING.sm },
    doneBtn: { backgroundColor: COLORS.success, borderRadius: BORDER_RADIUS.full, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    skipBtn: { backgroundColor: COLORS.divider, borderRadius: BORDER_RADIUS.full, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
    resultEmoji: { fontSize: 72, marginBottom: SPACING.md },
    resultTitle: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
    resultStatsRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.xl },
    resultStat: { alignItems: 'center' },
    statValue: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '800', color: COLORS.primary },
    statLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 4 },
});

export default SpeedChallengeScreen;
