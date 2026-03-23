/**
 * Concept Cards Screen — Feature 8
 * Flashcard-style DSA concept review with flip animation
 */

import { useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { CONCEPT_CARDS } from '../utils/dsaHelpers';

const ConceptCardsScreen = () => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const flipAnim = useRef(new Animated.Value(0)).current;

    const card = CONCEPT_CARDS[index];

    const flipCard = () => {
        const toValue = flipped ? 0 : 1;
        Animated.spring(flipAnim, {
            toValue,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
        }).start();
        setFlipped(!flipped);
    };

    const goNext = () => {
        if (flipped) flipCard();
        setTimeout(() => {
            setFlipped(false);
            flipAnim.setValue(0);
            setIndex(i => (i + 1) % CONCEPT_CARDS.length);
        }, flipped ? 150 : 0);
    };

    const goPrev = () => {
        if (flipped) flipCard();
        setTimeout(() => {
            setFlipped(false);
            flipAnim.setValue(0);
            setIndex(i => (i - 1 + CONCEPT_CARDS.length) % CONCEPT_CARDS.length);
        }, flipped ? 150 : 0);
    };

    const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📖 Concept Cards</Text>
                <Text style={styles.subtitle}>Card {index + 1} of {CONCEPT_CARDS.length}</Text>
            </View>

            {/* Progress dots */}
            <View style={styles.dotsRow}>
                {CONCEPT_CARDS.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>

            {/* Card area */}
            <TouchableOpacity style={styles.cardWrapper} onPress={flipCard} activeOpacity={0.95}>
                {/* Front */}
                <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
                    <Text style={styles.cardEmoji}>{card.emoji}</Text>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <View style={styles.tapHint}>
                        <MaterialCommunityIcons name="gesture-tap" size={16} color={COLORS.textLight} />
                        <Text style={styles.tapHintText}>Tap to reveal</Text>
                    </View>
                </Animated.View>

                {/* Back */}
                <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
                    <Text style={styles.backTitle}>{card.name}</Text>
                    <Text style={styles.backDesc}>{card.description}</Text>
                    <View style={styles.divider} />
                    <View style={styles.backRow}>
                        <MaterialCommunityIcons name="clock-fast" size={14} color={COLORS.primary} />
                        <Text style={styles.backMeta}>{card.timeComplexity}</Text>
                    </View>
                    <View style={styles.backRow}>
                        <MaterialCommunityIcons name="lightbulb-outline" size={14} color={COLORS.warning} />
                        <Text style={styles.backMeta}>{card.example}</Text>
                    </View>
                    <View style={styles.tapHint}>
                        <MaterialCommunityIcons name="gesture-tap" size={16} color={COLORS.textLight} />
                        <Text style={styles.tapHintText}>Tap to flip back</Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>

            {/* Navigation */}
            <View style={styles.navRow}>
                <TouchableOpacity style={styles.navBtn} onPress={goPrev} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.primary} />
                    <Text style={styles.navText}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.flipHint}>Tap card to flip</Text>
                <TouchableOpacity style={styles.navBtn} onPress={goNext} activeOpacity={0.8}>
                    <Text style={styles.navText}>Next</Text>
                    <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.lg, paddingBottom: SPACING.sm, alignItems: 'center' },
    title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
    dotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
    dotActive: { backgroundColor: COLORS.primary, width: 16 },
    cardWrapper: {
        flex: 1,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    card: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 24,
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backfaceVisibility: 'hidden',
        ...SHADOWS.lg,
    },
    cardFront: {
        backgroundColor: COLORS.primary,
    },
    cardBack: {
        backgroundColor: COLORS.surface,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    cardEmoji: { fontSize: 72, marginBottom: SPACING.lg },
    cardName: { fontSize: TYPOGRAPHY.fontSize['3xl'], fontWeight: '800', color: '#fff', textAlign: 'center' },
    tapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.xl, opacity: 0.7 },
    tapHintText: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLight },
    backTitle: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
    backDesc: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.md },
    divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
    backRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
    backMeta: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.text, flex: 1, lineHeight: 20 },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: SPACING.sm },
    navText: { fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.primary, fontWeight: '600' },
    flipHint: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLight },
});

export default ConceptCardsScreen;
