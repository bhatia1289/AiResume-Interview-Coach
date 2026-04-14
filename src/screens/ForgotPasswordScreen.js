/**
 * Forgot Password Screen
 * Allows user to request a password reset
 */

import { useRouter } from 'expo-router';
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

const ForgotPasswordScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handle Forgot Password Request
     */
    const handleRequestReset = async () => {
        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await authAPI.forgotPassword({ email });
            setLoading(false);

            if (result.success) {
                Alert.alert(
                    'Success',
                    'A reset simulation has been triggered. You can now set your new password.',
                    [
                        { 
                            text: 'Go to Reset', 
                            onPress: () => router.push({
                                pathname: '/reset-password',
                                params: { email: email.trim() }
                            }) 
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to request reset');
            }
        } catch (err) {
            setLoading(false);
            const errorMsg = err.data?.message || err.message || 'Something went wrong';
            Alert.alert('Request Failed', errorMsg);
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
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll help you reset your password.
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
                        error={error}
                    />

                    <Button
                        title="Send Reset Instructions"
                        onPress={handleRequestReset}
                        loading={loading}
                        style={styles.resetButton}
                    />

                    <View style={styles.footer}>
                        <Button
                            title="Back to Login"
                            variant="text"
                            onPress={() => router.back()}
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
    resetButton: {
        marginTop: SPACING.md,
    },
    footer: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
});

export default ForgotPasswordScreen;
