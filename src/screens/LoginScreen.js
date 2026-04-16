/**
 * Login Screen
 * User authentication with email and password
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
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (new TextEncoder().encode(password).length > 72) {
            newErrors.password = 'Password is too long (max 72 bytes)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle login
     */
    const handleLogin = async () => {
        setErrors({});
        if (!validateForm()) return;

        setLoading(true);
        const result = await login({ email, password });
        setLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            // Handle incorrect credentials with inline validation
            const isAuthError = 
                result.code === 'INVALID_CREDENTIALS' || 
                result.error?.toLowerCase().includes('invalid') || 
                result.error?.toLowerCase().includes('credentials');

            if (isAuthError) {
                setErrors({
                    email: ' ',
                    password: 'Invalid email or password'
                });
            } else {
                Alert.alert('Login Failed', result.error);
            }
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
                            <Text style={styles.title}>Welcome Back!</Text>
                            <Text style={[styles.subtitle, { color: COLORS.primary }]}>
                                Let's master algorithms together! 🚀
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
                            />

                            <Input
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                secureTextEntry
                                error={errors.password}
                            />

                            <TouchableOpacity 
                                onPress={() => router.push('/forgot-password')}
                                style={styles.forgetPasswordLink}
                            >
                                <Text style={styles.forgetPasswordText}>forget password</Text>
                            </TouchableOpacity>

                            <Button
                                title="Login"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.loginButton}
                            />

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                                <Button
                                    title="Register"
                                    variant="text"
                                    onPress={() => router.push('/register')}
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
        backgroundColor: '#F1F5F9', // Slightly cooler background
    },
    bgDecoration1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.primary + '10',
    },
    bgDecoration2: {
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: COLORS.secondary + '10',
    },
    bgDecoration3: {
        position: 'absolute',
        top: '20%',
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.warning + '08',
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
        paddingTop: 60,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: SPACING['2xl'],
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 12,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '900',
    },
    brandName: {
        fontSize: 48,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -1.5,
    },
    brandTagline: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: -6,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    contentWrapper: {
        marginTop: SPACING.sm,
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
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
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 15,
    },
    loginButton: {
        marginTop: SPACING.md,
        height: 60,
        borderRadius: 30,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    forgetPasswordLink: {
        alignSelf: 'flex-end',
        marginTop: 2,
        marginBottom: SPACING.lg,
    },
    forgetPasswordText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: '600',
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

export default LoginScreen;
