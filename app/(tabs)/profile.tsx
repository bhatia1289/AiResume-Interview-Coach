import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity, Animated, Modal, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { COLORS, SPACING, TYPOGRAPHY, getThemeColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { authAPI } from '../../src/services/api';

export default function ProfileScreen() {
    const { user, logout, refreshProfile, updateUser } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const router = useRouter();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const statsSlide = useRef(new Animated.Value(50)).current;
    const menuSlide = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.stagger(150, [
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
            ]),
            Animated.spring(statsSlide, { toValue: 0, friction: 7, tension: 35, useNativeDriver: true }),
            Animated.spring(menuSlide, { toValue: 0, friction: 7, tension: 30, useNativeDriver: true })
        ]).start();
    }, []);

    const colors = getThemeColors(isDarkMode);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshProfile();
        setRefreshing(false);
    }, [refreshProfile]);

    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Root layout should handle this, but explicit navigation is safer
                            router.replace('/login');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handlePickImage = async () => {
        Alert.alert(
            'Change Profile Picture',
            'ByteGrind would like to access your gallery to set a profile picture.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Open Gallery', 
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        
                        if (status !== 'granted') {
                            Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
                            return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.5,
                            base64: true,
                        });

                        if (!result.canceled) {
                            setPreviewImage(result.assets[0]);
                            setShowPreviewModal(true);
                        }
                    }
                }
            ]
        );
    };

    const handleConfirmUpload = () => {
        if (previewImage) {
            uploadImage(previewImage.base64);
            setShowPreviewModal(false);
        }
    };

    const uploadImage = async (base64) => {
        setUploading(true);
        try {
            const profilePicData = `data:image/jpeg;base64,${base64}`;
            const response = await authAPI.updateProfilePic({ profile_pic: profilePicData });
            
            if (response.success) {
                await updateUser(response.data);
                Alert.alert('Success', 'Profile picture updated successfully!');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Upload Failed', error.message || 'Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: colors.background }]} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
        >
            {/* Architectural Background Blobs */}
            <View style={styles.bgDecorations} pointerEvents="none">
                <View style={[styles.blob, styles.blob1, { backgroundColor: isDarkMode ? '#312e81' : '#e0e7ff' }]} />
                <View style={[styles.blob, styles.blob2, { backgroundColor: isDarkMode ? '#1e1b4b' : '#f5f3ff' }]} />
            </View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <View style={styles.headerBackground}>
                    <View style={styles.appBranding}>
                        <Text style={[styles.appName, { color: COLORS.primary }]}>ByteGrind</Text>
                        <View style={styles.appSeparator} />
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.avatarBorder, { borderColor: colors.surface }]}
                        onPress={handlePickImage}
                        disabled={uploading}
                    >
                        <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                            {uploading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : user?.profile_pic ? (
                                <Image source={{ uri: user.profile_pic }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            )}
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={12} color="#FFFFFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
                    <TouchableOpacity 
                        style={[styles.emailButton, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.8)' }]}
                        onPress={() => setShowEmailModal(true)}
                    >
                        <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.email, { color: colors.textSecondary }]}>View Email</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Stats Section */}
            <Animated.View style={[styles.statsSection, { opacity: fadeAnim, transform: [{ translateY: statsSlide }] }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
                <View style={styles.statsGrid}>
                    <Card style={[
                        styles.statItem, 
                        styles.glassCard, 
                        { 
                            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.65)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
                        }
                    ]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#E0F2FE' }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#0EA5E9" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{user?.total_solved || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Solved</Text>
                    </Card>
                    <Card style={[
                        styles.statItem, 
                        styles.glassCard, 
                        { 
                            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.65)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
                        }
                    ]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FFEDD5' }]}>
                            <Ionicons name="flame" size={24} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{user?.current_streak || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
                    </Card>
                </View>
            </Animated.View>

            {/* Settings & Security Sections */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: menuSlide }] }}>
                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
                    <Card style={[
                        styles.menuCard, 
                        styles.glassCard,
                        { 
                            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.65)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
                        }
                    ]}>
                        <View style={[styles.menuItem, { borderBottomColor: colors.divider }]}>
                            {/* Theme Toggle code same as before */}
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIcon, { backgroundColor: '#EDE9FE' }]}>
                                    <Ionicons name="color-palette" size={20} color="#7C3AED" />
                                </View>
                                <View>
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>Appearance</Text>
                                    <Text style={[styles.menuSubLabel, { color: colors.textSecondary }]}>
                                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={toggleDarkMode}
                                style={[
                                    styles.customToggleContainer,
                                    { backgroundColor: isDarkMode ? '#2D3748' : '#EDF2F7' }
                                ]}
                            >
                                <View style={[
                                    styles.customToggleBall,
                                    { 
                                        transform: [{ translateX: isDarkMode ? 24 : 0 }],
                                        backgroundColor: isDarkMode ? COLORS.primary : '#FFF'
                                    }
                                ]}>
                                    <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={14} color={isDarkMode ? '#FFF' : '#F6AD55'} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
                                    <Ionicons name="calendar" size={20} color="#0284C7" />
                                </View>
                                <View>
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>Joined</Text>
                                    <Text style={[styles.menuSubLabel, { color: colors.textSecondary }]}>
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Security */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
                    <Card style={[
                        styles.menuCard, 
                        styles.glassCard,
                        { 
                            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.65)',
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)'
                        }
                    ]}>
                        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push({ pathname: '/reset-password', params: { email: user?.email } })}>
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name="lock-closed" size={20} color="#EF4444" />
                                </View>
                                <View>
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>Change Password</Text>
                                    <Text style={[styles.menuSubLabel, { color: colors.textSecondary }]}>Update your account security</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>
            </Animated.View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity 
                    style={[styles.classyLogoutButton, { borderColor: isDarkMode ? '#374151' : '#F3F4F6' }]} 
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <Text style={[styles.brandText, { color: COLORS.primary }]}>ByteGrind</Text>
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.2.0 • Build 105</Text>
                    <Text style={[styles.attribution, { color: colors.textSecondary }]}>The daily grind of DSA prep</Text>
                </View>
            </View>

            {/* Profile Picture Preview/Done Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showPreviewModal}
                onRequestClose={() => setShowPreviewModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Preview Photo</Text>
                        
                        {previewImage && (
                            <Image 
                                source={{ uri: previewImage.uri }} 
                                style={styles.previewContainer} 
                            />
                        )}

                        <View style={styles.previewActionRow}>
                            <TouchableOpacity 
                                style={[styles.previewButton, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
                                onPress={() => setShowPreviewModal(false)}
                            >
                                <Text style={[styles.previewButtonText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.previewButton, { backgroundColor: COLORS.primary }]}
                                onPress={handleConfirmUpload}
                            >
                                <Text style={[styles.previewDoneText]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Creative Email Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showEmailModal}
                onRequestClose={() => setShowEmailModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.modalIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="mail-open" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Your Registered Email</Text>
                        
                        <View style={[styles.emailDisplayBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                            <Text style={[styles.emailDisplayText, { color: COLORS.primary }]}>{user?.email || 'user@example.com'}</Text>
                        </View>

                        <Text style={[styles.modalSubtext, { color: colors.textSecondary }]}>
                            This email is used for account recovery and communications.
                        </Text>

                        <TouchableOpacity 
                            style={[styles.modalCloseButton, { backgroundColor: COLORS.primary }]}
                            onPress={() => setShowEmailModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Awesome</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgDecorations: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.15,
    },
    blob1: {
        top: -100,
        right: -100,
    },
    blob2: {
        bottom: 100,
        left: -150,
    },
    content: {
        padding: SPACING.lg,
    },
    glassCard: {
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    avatarContainer: {
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBorder: {
        padding: 4,
        borderRadius: 60,
        borderWidth: 2,
        marginBottom: SPACING.md,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    headerBackground: {
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: SPACING.lg,
    },
    appBranding: {
        alignItems: 'center',
        marginBottom: 30,
    },
    premiumLogoBadge: {
        width: 60,
        height: 60,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        transform: [{ rotate: '-10deg' }],
    },
    premiumLogoText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '900',
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    appTagline: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 2,
        opacity: 0.7,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    email: {
        fontSize: 13,
        fontWeight: '600',
    },
    statsSection: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.md,
        opacity: 0.6,
        paddingHorizontal: SPACING.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: 20,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    menuCard: {
        borderRadius: 24,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuSubLabel: {
        fontSize: 13,
        marginTop: 1,
    },
    actionsContainer: {
        paddingVertical: SPACING.xl,
        alignItems: 'center',
    },
    classyLogoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    footerInfo: {
        marginTop: 40,
        alignItems: 'center',
    },
    brandText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.5,
    },
    attribution: {
        fontSize: 11,
        marginTop: 4,
        fontStyle: 'italic',
        opacity: 0.4,
    },
    previewContainer: {
        width: 240,
        height: 240,
        borderRadius: 120,
        marginVertical: SPACING.xl,
        borderWidth: 4,
        borderColor: COLORS.primary,
    },
    previewActionRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: SPACING.md,
    },
    previewButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
    },
    previewButtonText: {
        fontWeight: '700',
    },
    previewDoneText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    customToggleContainer: {
        width: 56,
        height: 32,
        borderRadius: 16,
        padding: 4,
        justifyContent: 'center',
    },
    customToggleBall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    emailDisplayBox: {
        width: '100%',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emailDisplayText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    modalSubtext: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    modalCloseButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
