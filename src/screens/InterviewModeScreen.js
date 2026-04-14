/**
 * Interview Mode Screen — Feature 7
 * AI-powered mock interview: AI asks follow-up questions about your solution
 */

import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { problemsAPI } from '../services/api';
import { randomFromArray, shuffleArray } from '../utils/dsaHelpers';

import { APP_TOPICS } from '../constants/leetcodeTopics';

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
};

const STARTER_QUESTIONS = [
    'Can you explain your approach to solving this problem?',
    'What is the time complexity of your solution?',
    'Why did you choose this data structure?',
    'Can you think of an edge case this solution might miss?',
    'How would you optimize this further?',
];

const InterviewModeScreen = () => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [problem, setProblem] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingProblem, setFetchingProblem] = useState(false);
    const listRef = useRef(null);
    const headerHeight = useHeaderHeight();

    const startSession = async () => {
        if (!selectedTopic) {
            Alert.alert('Select a Topic', 'Please choose a topic to start the interview.');
            return;
        }
        setFetchingProblem(true);
        setMessages([]);
        try {
            const problems = await problemsAPI.getProblemsByTopic(selectedTopic, 'all', 20);
            const validProblems = problems.filter(p => p.difficulty === 'medium' || p.difficulty === 'easy');
            const picked = randomFromArray(validProblems.length > 0 ? validProblems : problems);
            if (!picked) throw new Error('No problems found');
            setProblem(picked);
            const openingQ = randomFromArray(STARTER_QUESTIONS);
            setMessages([
                { id: 'sys', role: 'ai', text: `🧑‍💼 You're being interviewed on:\n\n**${picked.name || picked.title}** (${picked.difficulty})\n\n${stripHtml(picked.description || picked.content || '')}\n\n${openingQ}` },
            ]);
        } catch {
            Alert.alert('Error', 'Could not load a problem. Please try again.');
        } finally {
            setFetchingProblem(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { id: Date.now().toString(), role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Use the hint endpoint as the AI backbone, passing user's answer as context
            const res = await problemsAPI.getHint(problem.titleSlug || problem.id, userMsg.text);
            const data = res.data || res;
            const aiReply = data.hint || 'Interesting! Can you elaborate more on that approach?';
            const followUp = randomFromArray(STARTER_QUESTIONS.filter(q => q !== aiReply));
            setMessages(prev => [...prev, {
                id: Date.now().toString() + '_ai',
                role: 'ai',
                text: `${aiReply}\n\n❓ ${followUp}`,
            }]);
        } catch (error) {
            console.error("AI Interview Network Error:", error);
            const userTextLower = input.toLowerCase();
            let aiReply = "That's a valid perspective. Have you considered how this impacts memory complexity?";
            
            if (userTextLower.includes("array") || userTextLower.includes("list")) {
                aiReply = "Arrays are a good choice here. Wait, what about inserting elements at the beginning?";
            } else if (userTextLower.includes("hash") || userTextLower.includes("map") || userTextLower.includes("dictionary")) {
                aiReply = "Hash Maps offer O(1) lookups, which is excellent! Are there any tricky collision scenarios to handle?";
            } else if (userTextLower.includes("tree") || userTextLower.includes("graph")) {
                aiReply = "Using a Tree/Graph makes sense. Would you prefer Depth-First Search or Breadth-First Search for traversal?";
            } else if (userTextLower.includes("n^2") || userTextLower.includes("complexity")) {
                aiReply = "You're spot on with the complexity analysis! Is there any way we could push this down to O(n) or O(log n)?";
            }
            
            const followUp = randomFromArray(STARTER_QUESTIONS);
            setMessages(prev => [...prev, {
                id: Date.now().toString() + '_fallback',
                role: 'ai',
                text: `${aiReply}\n\n❓ ${followUp}`,
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 200);
        }
    };

    const renderMessage = ({ item }) => {
        const isAI = item.role === 'ai';
        return (
            <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
                {isAI && (
                    <MaterialCommunityIcons name="robot-outline" size={16} color={COLORS.primary} style={{ marginBottom: 4 }} />
                )}
                <Text style={[styles.bubbleText, isAI ? styles.bubbleTextAI : styles.bubbleTextUser]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={headerHeight}
        >
            <View style={styles.header}>
                <Text style={styles.title}>💬 AI Interview Mode</Text>
                <Text style={styles.subtitle}>Practice explaining your DSA solutions</Text>
            </View>

            {/* Topic picker */}
            {!problem && (
                <View style={styles.setupSection}>
                    <Text style={styles.sectionLabel}>Choose a Topic:</Text>
                    <View style={styles.topicsGrid}>
                        {APP_TOPICS.map(t => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.topicChip, selectedTopic === t && styles.topicChipSelected]}
                                onPress={() => setSelectedTopic(t)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.topicChipText, selectedTopic === t && styles.topicChipTextSelected]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[styles.startBtn, fetchingProblem && styles.startBtnDisabled]}
                        onPress={startSession}
                        disabled={fetchingProblem}
                        activeOpacity={0.85}
                    >
                        {fetchingProblem
                            ? <ActivityIndicator color="#fff" />
                            : <><MaterialCommunityIcons name="play" size={18} color="#fff" /><Text style={styles.startBtnText}>Start Interview</Text></>
                        }
                    </TouchableOpacity>
                </View>
            )}

            {problem && (
                <>
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.chat}
                        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                    />
                    {loading && (
                        <View style={styles.typingRow}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.typingText}>AI is typing…</Text>
                        </View>
                    )}
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.textInput}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Type your answer…"
                            placeholderTextColor={COLORS.textLight}
                            multiline
                            maxLength={600}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading || !input.trim()} activeOpacity={0.8}>
                            <MaterialCommunityIcons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.resetLink} onPress={() => { setProblem(null); setMessages([]); setInput(''); }}>
                        <Text style={styles.resetText}>↩ Change Topic</Text>
                    </TouchableOpacity>
                </>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg, paddingBottom: SPACING.sm },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    setupSection: { padding: SPACING.lg },
    sectionLabel: { fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
    topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
    topicChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm - 2,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    topicChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    topicChipText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, fontWeight: '500' },
    topicChipTextSelected: { color: '#fff', fontWeight: '700' },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: SPACING.md,
        ...SHADOWS.md,
    },
    startBtnDisabled: { opacity: 0.6 },
    startBtnText: { color: '#fff', fontSize: TYPOGRAPHY.fontSize.base, fontWeight: '700' },
    chat: { padding: SPACING.md, paddingBottom: SPACING.xl },
    bubble: {
        maxWidth: '80%',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    bubbleAI: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    bubbleUser: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    bubbleText: { fontSize: TYPOGRAPHY.fontSize.sm, lineHeight: 20 },
    bubbleTextAI: { color: COLORS.text },
    bubbleTextUser: { color: '#fff' },
    typingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, paddingTop: 0 },
    typingText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, fontStyle: 'italic' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    textInput: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.text,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.full,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetLink: { alignItems: 'center', paddingVertical: SPACING.sm },
    resetText: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.primary, fontWeight: '600' },
});

export default InterviewModeScreen;
