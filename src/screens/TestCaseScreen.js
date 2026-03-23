/**
 * Test Case Screen — Feature 10
 * Custom test case runner: AI evaluates if code produces expected output
 */

import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';

const TestCaseScreen = () => {
    const [code, setCode] = useState('');
    const [inputVal, setInputVal] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [result, setResult] = useState(null); // { verdict, explanation }
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!code.trim()) return Alert.alert('Missing Code', 'Please write your code first.');
        if (!inputVal.trim()) return Alert.alert('Missing Input', 'Please enter the test case input.');
        if (!expectedOutput.trim()) return Alert.alert('Missing Output', 'Please enter the expected output.');

        setLoading(true);
        setResult(null);

        try {
            // Build a synthetic problem slug to give AI context
            const syntheticSlug = 'custom-test-case';
            // Build context asking AI to evaluate the code against input/output
            const contextMsg =
                `Evaluate this code as a custom test case runner.\n\n` +
                `Test Input:\n${inputVal}\n\n` +
                `Expected Output:\n${expectedOutput}\n\n` +
                `Given the input above, would this code produce the expected output? Reply with a clear YES or NO verdict and brief explanation. DO NOT write the correct code.`;

            const res = await problemsAPI.getExplanation(syntheticSlug, code + '\n\n' + contextMsg);
            const data = res?.data || res;

            // Parse verdict from AI feedback
            const rawText = [
                data.hint,
                data.concept_explained,
                data.improvement_area,
            ].filter(Boolean).join('\n');

            const isPass = /yes|correct|produces the expected|matches/i.test(rawText) && !/no,|incorrect|wrong/i.test(rawText);
            setResult({ verdict: isPass ? 'pass' : 'fail', explanation: rawText || 'No explanation returned.' });
        } catch (err) {
            console.error('TestCase error:', err);
            setResult({ verdict: 'error', explanation: 'Could not connect to AI. Please check your backend connection.' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCode('');
        setInputVal('');
        setExpectedOutput('');
        setResult(null);
    };

    const verdictColor = {
        pass: COLORS.success,
        fail: COLORS.error,
        error: COLORS.warning,
    };
    const verdictIcon = {
        pass: 'check-circle',
        fail: 'close-circle',
        error: 'alert-circle',
    };
    const verdictLabel = {
        pass: '✅ Likely Correct',
        fail: '❌ Likely Incorrect',
        error: '⚠️ Could not evaluate',
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>🧪 Test Case Runner</Text>
                    <Text style={styles.subtitle}>Run your code against a custom test case</Text>
                </View>

                {/* Code section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="code-tags" size={16} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Your Code</Text>
                    </View>
                    <TextInput
                        style={styles.codeInput}
                        value={code}
                        onChangeText={setCode}
                        multiline
                        placeholder="# Write or paste your solution here…"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textAlignVertical="top"
                    />
                </View>

                {/* Input section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="arrow-right-circle-outline" size={16} color={COLORS.info} />
                        <Text style={styles.sectionTitle}>Test Input</Text>
                    </View>
                    <TextInput
                        style={styles.smallInput}
                        value={inputVal}
                        onChangeText={setInputVal}
                        multiline
                        placeholder="e.g. nums = [2,7,11,15], target = 9"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textAlignVertical="top"
                    />
                </View>

                {/* Expected output */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="arrow-left-circle-outline" size={16} color={COLORS.secondary} />
                        <Text style={styles.sectionTitle}>Expected Output</Text>
                    </View>
                    <TextInput
                        style={styles.smallInput}
                        value={expectedOutput}
                        onChangeText={setExpectedOutput}
                        multiline
                        placeholder="e.g. [0, 1]"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textAlignVertical="top"
                    />
                </View>

                {/* Result box */}
                {result && (
                    <View style={[styles.resultBox, { borderColor: verdictColor[result.verdict] }]}>
                        <View style={styles.resultHeader}>
                            <MaterialCommunityIcons
                                name={verdictIcon[result.verdict]}
                                size={24}
                                color={verdictColor[result.verdict]}
                            />
                            <Text style={[styles.verdictText, { color: verdictColor[result.verdict] }]}>
                                {verdictLabel[result.verdict]}
                            </Text>
                        </View>
                        <Text style={styles.explanationText}>{result.explanation}</Text>
                    </View>
                )}

                {/* Action buttons */}
                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="refresh" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.checkBtn, loading && styles.checkBtnDisabled]}
                        onPress={handleCheck}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <><MaterialCommunityIcons name="flask" size={18} color="#fff" /><Text style={styles.checkText}>Run Check</Text></>
                        }
                    </TouchableOpacity>
                </View>

                <View style={{ height: SPACING.xl }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: SPACING.lg },
    header: { marginBottom: SPACING.lg },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    section: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    sectionTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '700', color: COLORS.text },
    codeInput: {
        fontFamily: 'monospace',
        fontSize: 13,
        color: COLORS.text,
        backgroundColor: '#0F172A',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        minHeight: 160,
        color: '#E2E8F0',
    },
    smallInput: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.text,
        backgroundColor: COLORS.divider,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        minHeight: 60,
    },
    resultBox: {
        borderWidth: 1.5,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    verdictText: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '700' },
    explanationText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
    btnRow: { flexDirection: 'row', gap: SPACING.md },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.divider,
    },
    resetText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, fontWeight: '600' },
    checkBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.primary,
        ...SHADOWS.md,
    },
    checkBtnDisabled: { opacity: 0.6 },
    checkText: { fontSize: TYPOGRAPHY.fontSize.base, color: '#fff', fontWeight: '700' },
});

export default TestCaseScreen;
