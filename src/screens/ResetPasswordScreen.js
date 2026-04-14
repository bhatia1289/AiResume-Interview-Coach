/**
 * Reset Password Screen
 * Final step where user sets a new password
 */

import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { authAPI } from '../services/api';

const ResetPasswordScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [email, setEmail] = useState(params.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    /**
     * Validate form
     */
    const validateForm = () => {
        const newErrors = {};
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else {
            if (newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            } else if (new TextEncoder().encode(newPassword).length > 72) {
                newErrors.newPassword = 'Password is too long (max 72 bytes)';
            } else if (!/[A-Z]/.test(newPassword)) {
                newErrors.newPassword = 'Password must contain at least one uppercase letter';
            } else if (!/[a-z]/.test(newPassword)) {
                newErrors.newPassword = 'Password must contain at least one lowercase letter';
            } else if ((newPassword.match(/\d/g) || []).length < 3) {
                newErrors.newPassword = 'Password must contain at least 3 digits';
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                newErrors.newPassword = 'Password must contain at least one special character';
            }
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle Password Reset
     */
    const handleResetPassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await authAPI.resetPassword({
                email: email.trim(),
                new_password: newPassword,
            });
            setLoading(false);

            if (result.success) {
                Alert.alert(
                    'Success',
                    'Your password has been reset successfully. Please login with your new password.',
                    [
                        { 
                            text: 'Login Now', 
                            onPress: () => router.replace('/login') 
                        }
                    ]
                );
            } else {
                Alert.alert('Reset Failed', result.message || 'Failed to reset password');
            }
        } catch (err) {
            setLoading(false);
            console.error('Password reset error:', err);
            const errorMsg = err.data?.message || err.message || 'Something went wrong';
            Alert.alert('Reset Failed', errorMsg);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Set a new secure password for your account.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                        editable={!params.email} // Disable if email passed from previous screen
                    />

                    <Input
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Min 8 chars, A-Z, a-z, 3 digits, symbol"
                        secureTextEntry
                        error={errors.newPassword}
                        helperText="Must be 8+ chars with uppercase, lowercase, 3+ digits & a symbol"
                    />

                    <Input
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Repeat new password"
                        secureTextEntry
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Update Password"
                        onPress={handleResetPassword}
                        loading={loading}
                        style={styles.submitButton}
                    />

                    <View style={styles.footer}>
                        <Button
                            title="Cancel"
                            variant="text"
                            onPress={() => router.replace('/login')}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
    form: {
        marginTop: SPACING.lg,
    },
    submitButton: {
        marginTop: SPACING.md,
    },
    footer: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
});

export default ResetPasswordScreen;
