/**
 * Problem Detail Screen
 * Detailed view of a problem with code editor and AI assistance
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { problemsAPI } from '../services/api';
import { dsaFeaturesService } from '../services/dsaFeaturesService';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const ProblemDetailScreen = () => {
    const router = useRouter();
    const { problemSlug, fromChallenge } = useLocalSearchParams();
    const { height } = useWindowDimensions();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hintLoading, setHintLoading] = useState(false);
    const [explainLoading, setExplainLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description'); // 'description' | 'editor'
    const [selectedLanguage, setSelectedLanguage] = useState({ label: 'Python 3', value: 'Python3', icon: 'language-python' });
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [codesByLanguage, setCodesByLanguage] = useState({}); // Cache codes for different languages
    const [isBookmarked, setIsBookmarked] = useState(false);

    const LANGUAGES = [
        { label: 'Python 3', value: 'Python3', icon: 'language-python' },
        { label: 'Java', value: 'Java', icon: 'language-java' },
        { label: 'C++', value: 'C++', icon: 'language-cpp' },
        { label: 'C', value: 'C', icon: 'language-c' },
        { label: 'JavaScript', value: 'JavaScript', icon: 'language-javascript' },
        { label: 'TypeScript', value: 'TypeScript', icon: 'language-typescript' },
        { label: 'Go', value: 'Go', icon: 'language-go' },
        { label: 'Rust', value: 'Rust', icon: 'language-rust' },
        { label: 'Swift', value: 'Swift', icon: 'language-swift' },
        { label: 'Kotlin', value: 'Kotlin', icon: 'language-kotlin' },
        { label: 'Ruby', value: 'Ruby', icon: 'ruby' },
        { label: 'C#', value: 'CSharp', icon: 'language-csharp' },
        { label: 'PHP', value: 'PHP', icon: 'language-php' },
        { label: 'SQL', value: 'SQL', icon: 'database' },
        { label: 'R', value: 'R', icon: 'language-r' },
        { label: 'Dart', value: 'Dart', icon: 'bullseye' },
    ];
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);

    useEffect(() => {
        if (problemSlug) {
            fetchProblemDetails();
            checkBookmarkStatus();
        } else {
            setError('No problem identifier provided');
            setLoading(false);
        }
    }, [problemSlug]);

    const checkBookmarkStatus = async () => {
        if (!problemSlug) return;
        const status = await dsaFeaturesService.isBookmarked(problemSlug);
        setIsBookmarked(status);
    };

    const toggleBookmark = async () => {
        if (!problem) return;
        try {
            if (isBookmarked) {
                await dsaFeaturesService.removeBookmark(problemSlug);
                setIsBookmarked(false);
            } else {
                await dsaFeaturesService.addBookmark({
                    slug: problemSlug,
                    title: problem.title || problemSlug,
                    difficulty: problem.difficulty || problem.level || 'N/A'
                });
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error('Bookmark toggle error:', error);
            Alert.alert('Error', 'Failed to update bookmark');
        }
    };

    const fetchProblemDetails = async () => {
        try {
            setLoading(true);
            const data = await problemsAPI.getProblemDetails(problemSlug);

            // If the API returned no description (premium/locked problems), generate one via AI
            if (!data.content && !data.description) {
                try {
                    const aiRes = await problemsAPI.getHint(problemSlug, '');
                    const aiData = aiRes?.data || aiRes;
                    const concept = aiData?.concept_explained || '';
                    const hint = aiData?.hint || '';
                    if (concept || hint) {
                        data.content = `📌 Problem: ${data.title || problemSlug.replace(/-/g, ' ')}\n\n` +
                            (concept ? `🧠 Core Concept:\n${concept}\n\n` : '') +
                            (hint ? `💡 Approach Hint:\n${hint}` : '');
                    }
                } catch {
                    // Silently fall through — description will show the problem title as fallback
                }
            }

            setProblem(data);

            const initialTime = getTimeLimit(data.difficulty || data.level || 'easy');
            setTimeLeft(initialTime);
            setTimerActive(true);

            // Initialize codes by language from snippets
            const codes = {};
            if (data.codeSnippets && Array.isArray(data.codeSnippets)) {
                data.codeSnippets.forEach(s => {
                    codes[s.lang] = s.code;
                });
            }
            setCodesByLanguage(codes);

            // Default to Python3 if available, otherwise first available or placeholder
            const pythonSnippet = data.codeSnippets?.find(s => s.lang === 'Python3' || s.lang === 'Python');
            if (pythonSnippet) {
                setCode(pythonSnippet.code);
                setSelectedLanguage(LANGUAGES.find(l => l.value === 'Python3'));
            } else if (data.codeSnippets?.length > 0) {
                const first = data.codeSnippets[0];
                setCode(first.code);
                const langMatch = LANGUAGES.find(l => l.value === first.lang);
                if (langMatch) setSelectedLanguage(langMatch);
            } else {
                setCode('# Write your solution here');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Could not load problem details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getTimeLimit = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 10 * 60; // 10 minutes
            case 'medium': return 20 * 60; // 20 minutes
            case 'hard': return 30 * 60; // 30 minutes
            default: return 15 * 60;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            setIsTimeUp(true);
            setActiveTab('description');
            Alert.alert(
                "⌛ Time's Up!",
                "You've reached the time limit for this question level. The code editor has been closed.",
                [{ text: "OK" }]
            );
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const stripHtml = (html) => {
        if (!html) return '';
        return html
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
    };

    const handleLanguageChange = (lang) => {
        // Save current code to cache before switching
        setCodesByLanguage(prev => ({
            ...prev,
            [selectedLanguage.value]: code
        }));

        setSelectedLanguage(lang);
        
        // Load from cache or default template
        const cachedCode = codesByLanguage[lang.value];
        if (cachedCode) {
            setCode(cachedCode);
        } else {
            // Try to find in problem snippets
            const snippet = problem?.codeSnippets?.find(s => s.lang === lang.value);
            if (snippet) {
                setCode(snippet.code);
            } else {
                setCode(`// Write your ${lang.label} solution here`);
            }
        }
        setLanguageModalVisible(false);
    };

    const handleGetHint = async () => {
        if (!problem) return;
        setHintLoading(true);
        try {
            // Always fetch the AI-generated hint for every problem
            const res = await problemsAPI.getHint(problemSlug, code);
            const data = res.data || res;
            let hintText = data.hint || 'Try breaking the problem into smaller steps and think about which data structure best fits the access pattern.';

            // If the LeetCode problem also has built-in hints, append them as a bonus
            if (problem.hints && problem.hints.length > 0) {
                hintText += `\n\n📌 LeetCode Hint: ${problem.hints[0]}`;
            }

            Alert.alert('💡 AI Hint', hintText);
        } catch (err) {
            // Even on API failure, fall back to LeetCode hints if available
            if (problem.hints && problem.hints.length > 0) {
                Alert.alert('💡 Hint', problem.hints[0]);
            } else {
                Alert.alert('Error', 'Could not fetch hint. Please check your connection and try again.');
            }
        } finally {
            setHintLoading(false);
        }
    };

    const handleExplain = async () => {
        if (!problem) return;

        // Check if code is empty or just the default placeholder
        const isPlaceholder = code.includes('# Write your solution here') || code.trim() === '';
        if (isPlaceholder) {
            Alert.alert('Wait!', 'Please write the solution first');
            return;
        }

        setExplainLoading(true);
        try {
            const res = await problemsAPI.getExplanation(problemSlug, code);
            const data = res.data || res;
            
            const message = [
                data.hint ? `💡 ${data.hint}` : null,
                data.concept_explained ? `\n🧠 Concept: ${data.concept_explained}` : null,
                data.improvement_area ? `\n\n🛠️ Improvement: ${data.improvement_area}` : null,
                data.wrong_lines && data.wrong_lines.length > 0 
                    ? `\n\n❌ Lines to check:\n${data.wrong_lines.map(line => `• ${line}`).join('\n')}` 
                    : null
            ].filter(Boolean).join('\n');

            Alert.alert('Analysis & Feedback', message || 'No specific feedback available.');
        } catch (err) {
            console.error('Explanation error:', err);
            if (err.status === 401 || (err.data && err.data.error && err.data.error.includes('401'))) {
                Alert.alert('Session Expired', 'Please log out and log in again to continue.');
            } else {
                Alert.alert('Error', 'Could not fetch explanation. Please ensure your backend is running on --host 0.0.0.0');
            }
        } finally {
            setExplainLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) return Alert.alert('Wait!', 'Code area is empty.');
        
        // Final sanity check for junk before sending
        if (code.trim().length < 10) {
            return Alert.alert('Wait!', 'Your solution is too short to be valid.');
        }

        setSubmitting(true);
        try {
            const res = await problemsAPI.submitSolution(problemSlug, { 
                code, 
                language: selectedLanguage.value.toLowerCase() 
            });
            const result = res.data || res;

            if (result.status === 'solved') {
                setTimerActive(false); // Stop the timer when solved
                
                // Save attempt into local history
                await dsaFeaturesService.saveAttempt(problemSlug, problem?.title, code, selectedLanguage.value, 'solved', null);
                
                // Update overall progress state globally
                const topic = problem?.topicTags?.[0]?.name || problem?.topicTags?.[0] || 'Unknown';
                const difficulty = problem?.difficulty || problem?.level || 'easy';
                await problemsAPI.markProblemSolved(problemSlug, topic, difficulty);

                if (fromChallenge) {
                    // Opened from Speed Challenge — go back after alert
                    Alert.alert(
                        '✅ Solved!',
                        'Great job! Going back to the challenge for your next problem.',
                        [{ text: 'Continue', onPress: () => router.back() }]
                    );
                } else {
                    Alert.alert(
                        '✅ Solved!', 
                        'Great job! Your solution is correct and your progress has been updated.'
                    );
                }
            } else {
                const feedback = result.ai_feedback || 'Your logic is not quite there yet. Check the problem requirements and try again.';
                
                // Save attempt into local history
                await dsaFeaturesService.saveAttempt(problemSlug, problem?.title, code, selectedLanguage.value, 'failed', feedback);
                
                Alert.alert(
                    '❌ Incomplete', 
                    `The evaluator provided some feedback:\n\n"${feedback}"`
                );
            }
        } catch (err) {
            console.error('Submission Error:', err);
            Alert.alert('Error', 'Submission failed. Check your internet or backend connection.');
        } finally {
            setSubmitting(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return COLORS.easy;
            case 'medium': return COLORS.medium;
            case 'hard': return COLORS.hard;
            default: return COLORS.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading problem...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.errorIconWrapper}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={56} color={COLORS.error} />
                </View>
                <Text style={styles.errorTitle}>Oops!</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProblemDetails}>
                    <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const difficulty = problem?.difficulty || problem?.level || 'N/A';
    const difficultyColor = getDifficultyColor(difficulty);

    return (
        <View style={styles.mainContainer}>
            <Stack.Screen
                options={{
                    headerTitle: problem?.title || 'Problem',
                    headerStyle: { backgroundColor: COLORS.surface },
                    headerTintColor: COLORS.text,
                    headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleBookmark} style={{ padding: 8, marginRight: SPACING.xs }}>
                            <MaterialCommunityIcons
                                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                                size={26}
                                color={isBookmarked ? COLORS.primary : COLORS.textSecondary}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'description' && styles.tabActive]}
                    onPress={() => setActiveTab('description')}
                >
                    <MaterialCommunityIcons
                        name="text-box-outline"
                        size={16}
                        color={activeTab === 'description' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'description' && styles.tabTextActive]}>
                        Description
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'editor' && styles.tabActive]}
                    onPress={() => {
                        if (isTimeUp) {
                            Alert.alert("Time Explired", "The time limit for this question has passed.");
                        } else {
                            setActiveTab('editor');
                        }
                    }}
                >
                    <MaterialCommunityIcons
                        name="code-tags"
                        size={16}
                        color={activeTab === 'editor' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'editor' && styles.tabTextActive]}>
                        Code Editor
                    </Text>
                </TouchableOpacity>

                {/* Timer Display */}
                <View style={styles.timerContainer}>
                    <MaterialCommunityIcons 
                        name="clock-outline" 
                        size={16} 
                        color={timeLeft < 60 ? COLORS.error : COLORS.textSecondary} 
                    />
                    <Text style={[
                        styles.timerText, 
                        timeLeft < 60 && { color: COLORS.error, fontWeight: 'bold' }
                    ]}>
                        {formatTime(timeLeft)}
                    </Text>
                </View>
            </View>

            {activeTab === 'description' ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Problem Title Card */}
                    <View style={styles.titleCard}>
                        <View style={styles.titleRow}>
                            <Text style={styles.problemTitle} numberOfLines={2}>
                                {problem?.title || 'Problem Title'}
                            </Text>
                        </View>
                        <View style={styles.metaRow}>
                            {difficulty !== 'N/A' && (
                                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20', borderColor: difficultyColor }]}>
                                    <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
                                    <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                                        {difficulty}
                                    </Text>
                                </View>
                            )}
                            {problem?.acRate && (
                                <View style={styles.acRateBadge}>
                                    <MaterialCommunityIcons name="percent" size={13} color={COLORS.textSecondary} />
                                    <Text style={styles.acRateText}>
                                        {typeof problem.acRate === 'number'
                                            ? problem.acRate.toFixed(1)
                                            : problem.acRate}% acceptance
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Description Card */}
                    <View style={styles.descriptionCard}>
                        <View style={styles.descriptionCardHeader}>
                            <MaterialCommunityIcons name="text-box-multiple-outline" size={18} color={COLORS.primary} />
                            <Text style={styles.cardHeaderText}>Problem Statement</Text>
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.descriptionText}>
                            {stripHtml(problem?.content) || stripHtml(problem?.description) || 
                             (problem?.title ? `📌 ${problem.title}\n\nThis problem description is not available for this question. Use the "Get Hint" button below to get an AI-generated explanation of the problem and approach.` : 'No description available.')}
                        </Text>
                    </View>

                    {/* Topics/Tags */}
                    {problem?.topicTags && problem.topicTags.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="tag-multiple-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.cardHeaderText}>Topics</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.tagsRow}>
                                {problem.topicTags.map((tag, idx) => (
                                    <View key={idx} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag.name || tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* AI Actions */}
                    <View style={styles.aiActionsCard}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="robot-excited-outline" size={18} color={COLORS.primary} />
                            <Text style={styles.cardHeaderText}>AI Assistant</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.aiButtonsRow}>
                            <TouchableOpacity
                                style={[styles.aiButton, styles.hintButton]}
                                onPress={handleGetHint}
                                disabled={hintLoading}
                            >
                                {hintLoading ? (
                                    <ActivityIndicator color={COLORS.warning} size="small" />
                                ) : (
                                    <MaterialCommunityIcons name="lightbulb-outline" size={20} color={COLORS.warning} />
                                )}
                                <Text style={[styles.aiButtonText, { color: COLORS.warning }]}>
                                    {hintLoading ? 'Loading...' : 'Get Hint'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.aiButton, styles.explainButton]}
                                onPress={handleExplain}
                                disabled={explainLoading}
                            >
                                {explainLoading ? (
                                    <ActivityIndicator color={COLORS.info} size="small" />
                                ) : (
                                    <MaterialCommunityIcons name="brain" size={20} color={COLORS.info} />
                                )}
                                <Text style={[styles.aiButtonText, { color: COLORS.info }]}>
                                    {explainLoading ? 'Loading...' : 'Explain'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.goToEditorButton, isTimeUp && styles.disabledButton]}
                        onPress={() => {
                            if (isTimeUp) {
                                Alert.alert("Time's Up", "You can no longer access the editor for this question.");
                            } else {
                                setActiveTab('editor');
                            }
                        }}
                        disabled={isTimeUp}
                    >
                        <MaterialCommunityIcons name="code-tags" size={20} color="#fff" />
                        <Text style={styles.goToEditorText}>
                            {isTimeUp ? 'Time Expired' : 'Open Code Editor'}
                        </Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                    </TouchableOpacity>

                    <View style={{ height: 20 }} />
                </ScrollView>
            ) : (
                <View style={styles.editorContainer}>
                    {/* Editor Header */}
                    <View style={styles.editorHeader}>
                        <TouchableOpacity 
                            style={styles.editorHeaderLeft}
                            onPress={() => setLanguageModalVisible(true)}
                        >
                            <MaterialCommunityIcons name={selectedLanguage.icon} size={20} color={COLORS.primary} />
                            <Text style={styles.editorLangLabel}>{selectedLanguage.label}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={16} color="#94A3B8" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                        <View style={styles.editorDots}>
                            <View style={styles.editorTimer}>
                                <MaterialCommunityIcons 
                                    name="clock-outline" 
                                    size={14} 
                                    color={timeLeft < 60 ? COLORS.error : '#94A3B8'} 
                                />
                                <Text style={[
                                    styles.editorTimerText,
                                    timeLeft < 60 && { color: COLORS.error, fontWeight: 'bold' }
                                ]}>
                                    {formatTime(timeLeft)}
                                </Text>
                            </View>
                            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                        </View>
                    </View>

                    {/* Code Input */}
                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        multiline
                        style={[styles.codeInput, { minHeight: height * 0.45 }]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="# Write your Python solution here..."
                        placeholderTextColor="#6B7280"
                        textAlignVertical="top"
                        scrollEnabled
                    />

                    {/* Bottom Bar */}
                    <View style={styles.editorFooter}>
                        <TouchableOpacity
                            style={styles.hintSmallButton}
                            onPress={handleGetHint}
                            disabled={hintLoading}
                        >
                            {hintLoading ? (
                                <ActivityIndicator color={COLORS.warning} size="small" />
                            ) : (
                                <MaterialCommunityIcons name="lightbulb-outline" size={18} color={COLORS.warning} />
                            )}
                            <Text style={styles.hintSmallText}>Hint</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.explainSmallButton}
                            onPress={handleExplain}
                            disabled={explainLoading}
                        >
                            {explainLoading ? (
                                <ActivityIndicator color={COLORS.info} size="small" />
                            ) : (
                                <MaterialCommunityIcons name="brain" size={18} color={COLORS.info} />
                            )}
                            <Text style={styles.explainSmallText}>Explain</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <MaterialCommunityIcons name="send-check" size={18} color="#fff" />
                            )}
                            <Text style={styles.submitButtonText}>
                                {submitting ? 'Submitting...' : 'Submit'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* Language Selection Modal */}
            <Modal
                visible={languageModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setLanguageModalVisible(false)}
                >
                    <View style={styles.languageModal}>
                        <View style={styles.languageModalHeader}>
                            <Text style={styles.languageModalTitle}>Select Language</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.languageList}>
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.value}
                                    style={[
                                        styles.languageItem,
                                        selectedLanguage.value === lang.value && styles.languageItemActive
                                    ]}
                                    onPress={() => handleLanguageChange(lang)}
                                >
                                    <View style={styles.languageItemLeft}>
                                        <MaterialCommunityIcons 
                                            name={lang.icon} 
                                            size={22} 
                                            color={selectedLanguage.value === lang.value ? COLORS.primary : COLORS.textSecondary} 
                                        />
                                        <Text style={[
                                            styles.languageItemText,
                                            selectedLanguage.value === lang.value && styles.languageItemTextActive
                                        ]}>
                                            {lang.label}
                                        </Text>
                                    </View>
                                    {selectedLanguage.value === lang.value && (
                                        <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Loading Modal for AI Explanation/Hint */}
            <Modal
                transparent={true}
                visible={explainLoading || hintLoading}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingModal}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingModalTitle}>Analyzing solution...</Text>
                        <Text style={styles.loadingModalText}>
                            {explainLoading ? "Analyzing your solution for deep logic feedback..." : "Generating a helpful hint to get you unstuck..."}
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
    errorIconWrapper: {
        marginBottom: SPACING.md,
    },
    errorTitle: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.md,
    },
    retryText: {
        color: '#fff',
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        fontSize: TYPOGRAPHY.fontSize.base,
    },

    // Tab Bar
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingHorizontal: SPACING.md,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        marginBottom: -1,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    timerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
    },
    timerText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
    },
    disabledButton: {
        backgroundColor: COLORS.textLight,
        opacity: 0.7,
    },

    // Scroll content
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: SPACING['2xl'],
    },

    // Title Card
    titleCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    titleRow: {
        marginBottom: SPACING.md,
    },
    problemTitle: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        lineHeight: 32,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    difficultyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
    },
    difficultyDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    difficultyText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        textTransform: 'capitalize',
    },
    acRateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.divider,
    },
    acRateText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
    },

    // Shared card
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    // Description-specific card with primary colour accent
    descriptionCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        ...SHADOWS.sm,
    },
    descriptionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.primary + '12',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    cardHeaderText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    descriptionText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
        lineHeight: 26,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },

    // Tags
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    tag: {
        backgroundColor: COLORS.primary + '15',
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
    },
    tagText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.primary,
    },

    // AI Actions
    aiActionsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    aiButtonsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    aiButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    hintButton: {
        backgroundColor: COLORS.warning + '15',
        borderWidth: 1,
        borderColor: COLORS.warning + '40',
    },
    explainButton: {
        backgroundColor: COLORS.info + '15',
        borderWidth: 1,
        borderColor: COLORS.info + '40',
    },
    aiButtonText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    // Go To Editor Button
    goToEditorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md + 2,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.md,
    },
    goToEditorText: {
        color: '#fff',
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        flex: 1,
        textAlign: 'center',
    },

    // CODE EDITOR TAB
    editorContainer: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark editor background
    },
    editorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: '#1E293B',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    editorHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    editorLangLabel: {
        color: '#94A3B8',
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    editorDots: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 4,
    },
    editorTimer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#0F172A',
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#334155',
    },
    editorTimerText: {
        color: '#94A3B8',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    codeInput: {
        flex: 1,
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#E2E8F0',
        backgroundColor: '#0F172A',
        padding: SPACING.md,
        textAlignVertical: 'top',
        lineHeight: 22,
    },
    editorFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: '#1E293B',
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    hintSmallButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.warning + '20',
        borderWidth: 1,
        borderColor: COLORS.warning + '40',
    },
    hintSmallText: {
        color: COLORS.warning,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    explainSmallButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.info + '20',
        borderWidth: 1,
        borderColor: COLORS.info + '40',
    },
    explainSmallText: {
        color: COLORS.info,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    submitButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.secondary,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        ...SHADOWS.sm,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingModal: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        width: '90%',
        ...SHADOWS.lg,
    },
    loadingModalTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xs,
    },
    loadingModalText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    // Language Modal Styles
    languageModal: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        width: '100%',
        maxHeight: '60%',
        position: 'absolute',
        bottom: 0,
        ...SHADOWS.lg,
    },
    languageModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    languageModalTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
    },
    languageList: {
        paddingBottom: SPACING.md,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    languageItemActive: {
        backgroundColor: COLORS.primary + '08',
    },
    languageItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    languageItemText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
    },
    languageItemTextActive: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
});

export default ProblemDetailScreen;
