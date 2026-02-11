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
import Card from '../components/Card';
import HintComponent from '../components/HintComponent';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';
import { mockProblemDetail } from '../utils/mockData';

const ProblemDetailScreen = () => {
    const { problemId } = useLocalSearchParams();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingExplanation, setLoadingExplanation] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [hint, setHint] = useState(null);
    const [hintError, setHintError] = useState(null);
    const [hintLoading, setHintLoading] = useState(false);
    const [explanation, setExplanation] = useState(null);

    useEffect(() => {
        fetchProblem();
    }, [problemId]);

    /**
     * Fetch problem details
     * Falls back to mock data if API is unavailable
     */
    const fetchProblem = async () => {
        try {
            const data = await problemsAPI.getProblem(problemId);
            setProblem(data);
            // Set initial code template if available
            if (data.codeTemplate) {
                setCode(data.codeTemplate);
            }
        } catch (error) {
            console.error('Error fetching problem:', error);
            console.log('Using mock problem data for development...');

            // Use mock data when backend is not available
            setProblem(mockProblemDetail);
            if (mockProblemDetail.codeTemplate) {
                setCode(mockProblemDetail.codeTemplate);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Submit code solution
     */
    const handleSubmit = async () => {
        if (!code.trim()) {
            Alert.alert('Error', 'Please write some code before submitting');
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const result = await problemsAPI.submitSolution(problemId, {
                code,
                language: 'python', // Default to Python, can be made dynamic
            });

            setFeedback(result);
            Alert.alert(
                result.status === 'accepted' ? 'Success!' : 'Submission Received',
                result.message || 'Your code has been evaluated'
            );
        } catch (error) {
            console.error('Error submitting code:', error);
            Alert.alert('Error', 'Failed to submit code');
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * Request AI hint
     */
    const handleGetHint = async () => {
        setHintLoading(true);
        setHintError(null);
        
        try {
            const result = await problemsAPI.getHint(problemId);
            setHint(result.hint);
        } catch (error) {
            console.error('Error getting hint:', error);
            
            let errorMessage = 'Failed to get AI hint';
            
            // Handle specific error cases
            if (error.response?.status === 429) {
                errorMessage = 'Too many requests. Please wait a moment.';
            } else if (error.response?.status === 500) {
                errorMessage = 'AI service is temporarily unavailable';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication required';
            } else if (error.message?.includes('Network')) {
                errorMessage = 'Network connection error';
            }
            
            setHintError(errorMessage);
            
            // Optionally show fallback hint after error
            setTimeout(() => {
                setHint('Try using a hash map to store the numbers you\'ve seen. For each number, check if its complement (target - number) exists in the hash map.');
                setHintError(null);
            }, 3000);
        } finally {
            setHintLoading(false);
        }
    };

    /**
     * Request AI explanation
     */
    const handleGetExplanation = async () => {
        setLoadingExplanation(true);
        try {
            const result = await problemsAPI.getExplanation(problemId);
            setExplanation(result.explanation);
        } catch (error) {
            console.error('Error getting explanation:', error);
            // Use mock explanation when API is unavailable
            setExplanation('This problem can be solved using a hash map approach. As you iterate through the array, store each number and its index. For each number, calculate the complement (target - current number) and check if it exists in the hash map. This gives you O(n) time complexity and O(n) space complexity.');
        } finally {
            setLoadingExplanation(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Problem Header */}
            <Card style={styles.headerCard}>
                <Text style={styles.title}>{problem?.title}</Text>
                <View style={styles.metaInfo}>
                    <View
                        style={[
                            styles.difficultyBadge,
                            { backgroundColor: COLORS[problem?.difficulty?.toLowerCase()] },
                        ]}
                    >
                        <Text style={styles.difficultyText}>{problem?.difficulty}</Text>
                    </View>
                </View>
            </Card>

            {/* Problem Description */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{problem?.description}</Text>
            </Card>

            {/* Examples */}
            {problem?.examples && problem.examples.length > 0 && (
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Examples</Text>
                    {problem.examples.map((example, index) => (
                        <View key={index} style={styles.example}>
                            <Text style={styles.exampleLabel}>Example {index + 1}:</Text>
                            <Text style={styles.exampleText}>Input: {example.input}</Text>
                            <Text style={styles.exampleText}>Output: {example.output}</Text>
                            {example.explanation && (
                                <Text style={styles.exampleExplanation}>
                                    Explanation: {example.explanation}
                                </Text>
                            )}
                        </View>
                    ))}
                </Card>
            )}

            {/* Constraints */}
            {problem?.constraints && (
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Constraints</Text>
                    <Text style={styles.constraints}>{problem.constraints}</Text>
                </Card>
            )}

            {/* Code Editor */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Your Solution</Text>
                <Input
                    value={code}
                    onChangeText={setCode}
                    placeholder="Write your code here..."
                    multiline
                    numberOfLines={15}
                    style={styles.codeEditor}
                />
            </Card>

            {/* AI Assistance Buttons */}
            <View style={styles.aiButtons}>
                <Button
                    title={hint ? "Get New Hint 💡" : "Get Hint 💡"}
                    variant="outline"
                    onPress={handleGetHint}
                    loading={hintLoading}
                    disabled={hintLoading}
                    style={styles.aiButton}
                />
                <Button
                    title="Explain 📖"
                    variant="outline"
                    onPress={handleGetExplanation}
                    loading={loadingExplanation}
                    style={styles.aiButton}
                />
            </View>

            {/* Hint Display */}
            <HintComponent
                hint={hint}
                loading={hintLoading}
                error={hintError}
                onRetry={handleGetHint}
                visible={hint !== null || hintLoading || hintError !== null}
                initiallyExpanded={true}
            />

            {/* Explanation Display */}
            {explanation && (
                <Card style={[styles.section, styles.explanationCard]}>
                    <Text style={styles.explanationTitle}>📖 Explanation</Text>
                    <Text style={styles.explanationText}>{explanation}</Text>
                </Card>
            )}

            {/* Feedback Display */}
            {feedback && (
                <Card
                    style={[
                        styles.section,
                        styles.feedbackCard,
                        {
                            backgroundColor:
                                feedback.status === 'accepted'
                                    ? COLORS.success + '20'
                                    : COLORS.warning + '20',
                        },
                    ]}
                >
                    <Text style={styles.feedbackTitle}>
                        {feedback.status === 'accepted' ? '✓ Accepted' : '⚠ Feedback'}
                    </Text>
                    <Text style={styles.feedbackText}>{feedback.feedback}</Text>
                </Card>
            )}

            {/* Submit Button */}
            <Button
                title="Submit Solution"
                onPress={handleSubmit}
                loading={submitting}
                style={styles.submitButton}
            />
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
    headerCard: {
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
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
    section: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    example: {
        marginBottom: SPACING.md,
        padding: SPACING.sm,
        backgroundColor: COLORS.divider,
        borderRadius: 8,
    },
    exampleLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    exampleText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
        marginBottom: SPACING.xs,
    },
    exampleExplanation: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        fontStyle: 'italic',
    },
    constraints: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    codeEditor: {
        fontFamily: 'monospace',
        fontSize: TYPOGRAPHY.fontSize.sm,
    },
    aiButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    aiButton: {
        flex: 1,
    },
    
    explanationCard: {
        backgroundColor: COLORS.secondary + '10',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.secondary,
    },
    explanationTitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.secondary,
        marginBottom: SPACING.sm,
    },
    explanationText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    feedbackCard: {
        borderLeftWidth: 4,
    },
    feedbackTitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        marginBottom: SPACING.sm,
    },
    feedbackText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        lineHeight: 20,
    },
    submitButton: {
        marginBottom: SPACING.xl,
    },
});

export default ProblemDetailScreen;
