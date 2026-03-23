/**
 * TagFilter Component
 * Horizontal scrollable tag chips for multi-tag selection
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const TagFilter = ({ tags = [], selectedTags = [], onToggle }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
        >
            {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onToggle && onToggle(tag)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {tag}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        gap: SPACING.sm,
    },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm - 2,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default TagFilter;
