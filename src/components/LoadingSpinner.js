/**
 * Loading Spinner Component
 * Centered loading indicator
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, getThemeColors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({ size = 'large', color = COLORS.primary, fullScreen = true }) => {
    const { isDarkMode } = useTheme();
    const colors = getThemeColors(isDarkMode);

    if (fullScreen) {
        return (
            <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
                <ActivityIndicator size={size} color={color} />
            </View>
        );
    }

    return <ActivityIndicator size={size} color={color} />;
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoadingSpinner;
