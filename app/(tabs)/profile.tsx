/**
 * Profile Screen
 * User profile and settings
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
    const { user, logout, refreshProfile } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

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
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Profile Header */}
            <Card style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
            </Card>

            {/* Stats */}
            <Card style={styles.statsCard}>
                <Text style={styles.sectionTitle}>Your Stats</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.total_solved || 0}</Text>
                        <Text style={styles.statLabel}>Problems Solved</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{user?.current_streak || 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                </View>
            </Card>

            {/* Settings */}
            <Card style={styles.settingsCard}>
                <Text style={styles.sectionTitle}>Settings</Text>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Account Type</Text>
                    <Text style={styles.settingValue}>Free</Text>
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Member Since</Text>
                    <Text style={styles.settingValue}>
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                </View>
            </Card>

            {/* Logout Button */}
            <Button
                title="Logout"
                variant="outline"
                onPress={handleLogout}
                style={styles.logoutButton}
            />

            {/* App Info */}
            <View style={styles.appInfo}>
                <Text style={styles.appInfoText}>DSA Learning Assistant v1.0.0</Text>
                <Text style={styles.appInfoText}>Made with ❤️ for learners</Text>
            </View>
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: TYPOGRAPHY.fontSize['3xl'],
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    name: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    email: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
    statsCard: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.divider,
    },
    statValue: {
        fontSize: TYPOGRAPHY.fontSize['2xl'],
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    settingsCard: {
        marginBottom: SPACING.lg,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    settingLabel: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.text,
    },
    settingValue: {
        fontSize: TYPOGRAPHY.fontSize.base,
        color: COLORS.textSecondary,
    },
    logoutButton: {
        marginBottom: SPACING.xl,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    appInfoText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        opacity: 0.7,
    },
});
