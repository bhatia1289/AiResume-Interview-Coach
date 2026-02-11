/**
 * Input Component
 * Reusable text input with label and error handling
 */

import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error,
    multiline = false,
    numberOfLines = 1,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    error && styles.inputError,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={numberOfLines}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: SPACING.sm,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.error,
        marginTop: SPACING.xs,
    },
});

export default Input;
