import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity, Animated, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { COLORS, SPACING, TYPOGRAPHY, getThemeColors } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProfileScreen() {
    const { user, logout, refreshProfile } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const router = useRouter();

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

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: colors.background }]} 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
            }
        >
            {/* Header section with classy background */}
            <View style={styles.headerBackground}>
                <View style={[styles.avatarBorder, { borderColor: colors.surface }]}>
                    <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
                <TouchableOpacity 
                    style={[styles.emailButton, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}
                    onPress={() => setShowEmailModal(true)}
                >
                    <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.email, { color: colors.textSecondary }]}>View Email</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Section with improved layout */}
            <View style={styles.statsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
                <View style={styles.statsGrid}>
                    <Card style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#E0F2FE' }]}>
                            <Ionicons name="checkmark-circle" size={24} color="#0EA5E9" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{user?.total_solved || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Solved</Text>
                    </Card>
                    <Card style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FFEDD5' }]}>
                            <Ionicons name="flame" size={24} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>{user?.current_streak || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
                    </Card>
                </View>
            </View>

            {/* Settings Menu - Classy List Style */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
                <Card style={[styles.menuCard, { backgroundColor: colors.surface }]}>
                    {/* Appearance / Theme Toggle */}
                    <View style={[styles.menuItem, { borderBottomColor: colors.divider }]}>
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
                                <Ionicons 
                                    name={isDarkMode ? 'moon' : 'sunny'} 
                                    size={14} 
                                    color={isDarkMode ? '#FFF' : '#F6AD55'} 
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Member Since */}
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
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.2.0 • Build 104</Text>
                    <Text style={[styles.attribution, { color: colors.textSecondary }]}>Tailored with precision</Text>
                </View>
            </View>

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
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.lg,
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
    headerBackground: {
        alignItems: 'center',
        paddingVertical: 40,
        marginBottom: SPACING.lg,
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
