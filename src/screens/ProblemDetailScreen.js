/**
 * Problem Detail Screen
 * Detailed view of a problem with code editor and AI assistance
 */

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Button from '../components/Button';
import Card, { EmptyState } from '../components/Card';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING } from '../constants/theme';
import { problemsAPI } from '../services/api';

const ProblemDetailScreen = () => {
    const { problemId } = useLocalSearchParams();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [hintLoading, setHintLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProblem();
    }, [problemId]);

    const fetchProblem = async () => {
        try {
            const data = await problemsAPI.getProblem(problemId);
            setProblem(data);
            if (data.code_template) setCode(data.code_template);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Could not load problem details.');
        } finally {
            setLoading(false);
        }
    };

    const handleGetHint = async () => {
        setHintLoading(true);
        setAiResult(null);
        try {
            const result = await problemsAPI.getHint(problemId, code);
            setAiResult({ ...result, type: 'hint' });
        } catch (err) {
            Alert.alert('AI Offline', 'Could not reach the AI tutor. Please try again later.');
        } finally {
            setHintLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) return Alert.alert('Wait!', 'Code area is empty.');

        setSubmitting(true);
        try {
            const result = await problemsAPI.submitSolution(problemId, { code, language: 'python' });
            setAiResult({ ...result, type: 'feedback' });
            Alert.alert('Analysis Complete', 'Swipe down to see detailed feedback!');
        } catch (err) {
            Alert.alert('Error', 'Submission failed. Check your internet.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <EmptyState title="Oops!" message={error} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header info */}
            <Card style={styles.headerCard}>
                <Text style={styles.title}>{problem?.title}</Text>
                <View style={[styles.badge, { backgroundColor: COLORS[problem?.difficulty?.toLowerCase()] + '20' }]}>
                    <Text style={[styles.badgeText, { color: COLORS[problem?.difficulty?.toLowerCase()] }]}>
                        {problem?.difficulty?.toUpperCase()}
                    </Text>
                </View>
            </Card>

            {/* Problem text */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Problem Statement</Text>
                <Text style={styles.description}>{problem?.description}</Text>
                {problem?.constraints && (
                    <View style={styles.constraintsBox}>
                        <Text style={styles.constraintsTitle}>Constraints:</Text>
                        <Text style={styles.constraintsText}>{problem.constraints}</Text>
                    </View>
                )}
            </Card>

            {/* Examples */}
            {problem?.examples?.map((ex, i) => (
                <Card key={i} style={styles.exampleCard} padding="sm">
                    <Text style={styles.exampleTitle}>Example {i + 1}</Text>
                    <View style={styles.codeBox}>
                        <Text style={styles.monoText}>Input: {ex.input}</Text>
                        <Text style={styles.monoText}>Output: {ex.output}</Text>
                    </View>
                </Card>
            ))}

            {/* Editor */}
            <View style={styles.editorWrapper}>
                <Text style={styles.sectionTitle}>Python Solution</Text>
                <Input
                    value={code}
                    onChangeText={setCode}
                    multiline
                    numberOfLines={10}
                    style={styles.codeEditor}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {/* AI Action area */}
            <View style={styles.actionRow}>
                <Button
                    title="Get Hint 💡"
                    variant="outline"
                    onPress={handleGetHint}
                    loading={hintLoading}
                    style={styles.flexButton}
                />
                <Button
                    title="Submit Code 🚀"
                    onPress={handleSubmit}
                    loading={submitting}
                    style={styles.flexButton}
                />
            </View>

            {/* AI Result View (Common for Hint and Feedback) */}
            {aiResult && (
                <Card style={[
                    styles.aiResultCard,
                    { borderColor: aiResult.type === 'hint' ? COLORS.info : COLORS.success }
                ]}>
                    <Text style={[
                        styles.aiTypeHeader,
                        { color: aiResult.type === 'hint' ? COLORS.info : COLORS.success }
                    ]}>
                        {aiResult.type === 'hint' ? '💡 Smart Hint' : '✅ Code Analysis'}
                    </Text>

                    <View style={styles.aiSection}>
                        <Text style={styles.aiLabel}>The Nudge:</Text>
                        <Text style={styles.aiContent}>{aiResult.hint}</Text>
                    </View>

                    <View style={styles.aiSection}>
                        <Text style={styles.aiLabel}>Logic & Concepts:</Text>
                        <Text style={styles.aiContent}>{aiResult.concept_explained}</Text>
                    </View>

                    <View style={styles.aiSection}>
                        <Text style={styles.aiLabel}>Areas to Improve:</Text>
                        <Text style={styles.aiContent}>{aiResult.improvement_area}</Text>
                    </View>
                </Card>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.md },
    headerCard: { marginBottom: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, flex: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 12, fontWeight: '700' },

    section: { marginBottom: SPACING.md },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
    description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },

    constraintsBox: { marginTop: 12, padding: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
    constraintsTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    constraintsText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: 'monospace' },

    exampleCard: { marginBottom: SPACING.sm, backgroundColor: '#fff' },
    exampleTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
    codeBox: { padding: 8, backgroundColor: COLORS.divider, borderRadius: 4 },
    monoText: { fontFamily: 'monospace', fontSize: 13, color: COLORS.textSecondary },

    editorWrapper: { marginVertical: SPACING.md },
    codeEditor: { fontFamily: 'monospace', height: 250, backgroundColor: '#fff', fontSize: 14, textAlignVertical: 'top' },

    actionRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    flexButton: { flex: 1 },

    aiResultCard: { marginTop: SPACING.sm, borderLeftWidth: 5, backgroundColor: '#fff', marginBottom: SPACING.xl },
    aiTypeHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    aiSection: { marginBottom: 12 },
    aiLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2, textTransform: 'uppercase' },
    aiContent: { fontSize: 15, color: COLORS.text, lineHeight: 21 }
});

export default ProblemDetailScreen;
