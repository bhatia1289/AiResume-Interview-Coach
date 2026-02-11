/**
 * Authentication Context
 * Global state management for user authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);

    // Load user from storage on app start
    useEffect(() => {
        loadUserFromStorage();
    }, []);

    /**
     * Load user and token from AsyncStorage
     */
    const loadUserFromStorage = async () => {
        try {
            const [storedToken, storedUser] = await Promise.all([
                AsyncStorage.getItem('authToken'),
                AsyncStorage.getItem('user'),
            ]);

            if (storedToken && storedUser) {
                setAuthToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Register new user
     * @param {Object} data - { name, email, password }
     */
    const register = async (data) => {
        try {
            const response = await authAPI.register(data);

            // Store token and user
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            setAuthToken(response.token);
            setUser(response.user);

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    /**
     * Login user
     * @param {Object} data - { email, password }
     */
    const login = async (data) => {
        try {
            const response = await authAPI.login(data);

            // Store token and user
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            setAuthToken(response.token);
            setUser(response.user);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed',
            };
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            // Clear storage
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');

            // Clear state
            setAuthToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    /**
     * Update user profile
     * @param {Object} updatedUser
     */
    const updateUser = async (updatedUser) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const value = {
        user,
        authToken,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
