/**
 * SearchBar Component
 * Animated search input with clear button and debounce support
 */

import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const SearchBar = ({
    placeholder = 'Search problems…',
    onSearch,
    debounceMs = 400,
    style,
}) => {
    const [query, setQuery] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const timer = useRef(null);

    const handleFocus = () => {
        Animated.spring(scaleAnim, { toValue: 1.02, useNativeDriver: true, friction: 5 }).start();
    };
    const handleBlur = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    };

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (onSearch) onSearch(query.trim());
        }, debounceMs);
        return () => clearTimeout(timer.current);
    }, [query]);

    const handleClear = () => {
        setQuery('');
        if (onSearch) onSearch('');
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }, style]}>
            <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} style={styles.icon} />
            <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {query.length > 0 && (
                <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
    },
});

export default SearchBar;
