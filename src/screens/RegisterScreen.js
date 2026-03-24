/**
 * Register Screen
 * New user registration
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
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    /**
     * Validate form inputs
     */
    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else {
            if (password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            } else if (new TextEncoder().encode(password).length > 72) {
                newErrors.password = 'Password is too long (max 72 bytes)';
            } else if (!/[A-Z]/.test(password)) {
                newErrors.password = 'Password must contain at least one uppercase letter';
            } else if (!/[a-z]/.test(password)) {
                newErrors.password = 'Password must contain at least one lowercase letter';
            } else if ((password.match(/\d/g) || []).length < 3) {
                newErrors.password = 'Password must contain at least 3 digits';
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                newErrors.password = 'Password must contain at least one special character';
            }
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle registration
     */
    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const result = await register({ name: name.trim(), email, password });
        setLoading(false);

        if (result.success) {
            // Navigation will be handled automatically by the root layout
            router.replace('/(tabs)');
        } else {
            Alert.alert('Registration Failed', result.error);
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Start your DSA learning journey today
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                        error={errors.name}
                    />

                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min 8 chars, A-Z, a-z, 3 digits, symbol"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Input
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm your password"
                        secureTextEntry
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Register"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Button
                            title="Login"
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
    registerButton: {
        marginTop: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    footerText: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
});

export default RegisterScreen;
