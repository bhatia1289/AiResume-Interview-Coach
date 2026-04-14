/**
 * Input Component
 * Reusable text input with label and error handling
 */

import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error,
    helperText,
    multiline = false,
    numberOfLines = 1,
    style,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const isPasswordField = secureTextEntry;
    const shouldHideText = isPasswordField && !isPasswordVisible;
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        error && styles.inputError,
                        isPasswordField && styles.passwordInput,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry={shouldHideText}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    {...props}
                />
                {isPasswordField && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.6}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
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
        flex: 1,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        paddingRight: 45, // Make space for the eye icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        height: '100%',
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: SPACING.sm,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    helperText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        fontStyle: 'italic',
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.xs,
        color: COLORS.error,
        marginTop: SPACING.xs,
    },
});

export default Input;
