/**
 * Register Screen
 * New user registration
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
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

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const brandScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(brandScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Premium Background Decorations */}
            <View style={styles.bgDecoration1} />
            <View style={styles.bgDecoration2} />
            <View style={styles.bgDecoration3} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[
                        styles.brandContainer,
                        { opacity: fadeAnim, transform: [{ scale: brandScale }] }
                    ]}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>BG</Text>
                        </View>
                        <Text style={styles.brandName}>ByteGrind</Text>
                        <Text style={styles.brandTagline}>the daily grind of dsa prep</Text>
                    </Animated.View>

                    <Animated.View style={[
                        styles.contentWrapper,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Join ByteGrind</Text>
                            <Text style={[styles.subtitle, { color: COLORS.primary }]}>
                                Master DSA, one grind at a time! ⚔️
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
                                helperText="Must be 8+ chars with uppercase, lowercase, 3+ digits & a symbol"
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
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    bgDecoration1: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: COLORS.primary + '10',
    },
    bgDecoration2: {
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: COLORS.secondary + '10',
    },
    bgDecoration3: {
        position: 'absolute',
        top: '15%',
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.warning + '08',
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
        paddingTop: 40,
        paddingBottom: 60,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
    },
    brandName: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -1,
    },
    brandTagline: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '700',
        marginTop: -4,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    contentWrapper: {
        marginTop: SPACING.xs,
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '700',
        opacity: 0.9,
    },
    form: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: SPACING.xl,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 25,
        elevation: 12,
    },
    registerButton: {
        marginTop: SPACING.lg,
        height: 60,
        borderRadius: 30,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});

export default RegisterScreen;
