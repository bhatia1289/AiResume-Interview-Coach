/**
 * Hint Component
 * Expandable AI-powered hint display with typing animation
 */

import React, { useState, useEffect } from 'react';
import {
    Animated,
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TypingIndicator = () => {
    const [dots] = useState([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]);

    useEffect(() => {
        const animations = dots.map((dot, index) => {
            return Animated.sequence([
                Animated.delay(index * 200),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                ),
            ]);
        });

        Animated.parallel(animations).start();

        return () => {
            animations.forEach(animation => animation.stop());
        };
    }, []);

    return (
        <View style={styles.typingContainer}>
            <Text style={styles.typingText}>AI is thinking</Text>
            <View style={styles.dotsContainer}>
                {dots.map((dot, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                opacity: dot,
                                transform: [{
                                    translateY: dot.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -4],
                                    }),
                                }],
                            },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const HintComponent = ({ 
    hint, 
    loading, 
    error, 
    onRetry, 
    visible = true,
    initiallyExpanded = true 
}) => {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
    const [fadeAnim] = useState(new Animated.Value(visible ? 1 : 0));

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [isExpanded]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <TypingIndicator />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>❌ Failed to get hint</Text>
                    <Text style={styles.errorSubtext}>{error}</Text>
                    <Pressable onPress={onRetry} style={styles.retryButton}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </Pressable>
                </View>
            );
        }

        if (!hint) {
            return null;
        }

        return (
            <View style={styles.hintContent}>
                {isExpanded ? (
                    <Text style={styles.hintText}>{hint}</Text>
                ) : (
                    <Text style={styles.hintText} numberOfLines={2} ellipsizeMode="tail">
                        {hint}
                    </Text>
                )}
            </View>
        );
    };

    if (!visible && !hint && !loading && !error) {
        return null;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Pressable
                onPress={toggleExpanded}
                style={[
                    styles.hintCard,
                    !isExpanded && styles.collapsedCard,
                    loading && styles.loadingCard,
                    error && styles.errorCard,
                ]}
                disabled={loading || error || !hint}
            >
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={[
                            styles.hintTitle,
                            error && styles.errorTitle,
                            loading && styles.loadingTitle,
                        ]}>
                            {loading ? '💡 Getting Hint...' : error ? '❌ Error' : '💡 AI Hint'}
                        </Text>
                        {!loading && !error && hint && (
                            <Text style={styles.expandIndicator}>
                                {isExpanded ? '▼' : '▶'}
                            </Text>
                        )}
                    </View>
                </View>

                {renderContent()}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    hintCard: {
        backgroundColor: COLORS.info + '15',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.info,
        borderRadius: 12,
        padding: SPACING.md,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    collapsedCard: {
        paddingBottom: SPACING.md,
    },
    loadingCard: {
        backgroundColor: COLORS.warning + '15',
        borderLeftColor: COLORS.warning,
    },
    errorCard: {
        backgroundColor: COLORS.error + '15',
        borderLeftColor: COLORS.error,
    },
    header: {
        marginBottom: 0,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hintTitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.info,
        flex: 1,
    },
    loadingTitle: {
        color: COLORS.warning,
    },
    errorTitle: {
        color: COLORS.error,
    },
    expandIndicator: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        marginLeft: SPACING.sm,
    },
    hintContent: {
        marginTop: SPACING.sm,
    },
    hintText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typingText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.warning,
        marginHorizontal: 2,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        color: COLORS.error,
        marginBottom: SPACING.xs,
    },
    errorSubtext: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    retryButton: {
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: 8,
    },
    retryText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
});

export default HintComponent;