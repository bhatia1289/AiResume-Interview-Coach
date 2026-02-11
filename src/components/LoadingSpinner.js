/**
 * Loading Spinner Component
 * Centered loading indicator
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

const LoadingSpinner = ({ size = 'large', color = COLORS.primary, fullScreen = true }) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
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
        backgroundColor: COLORS.background,
    },
});

export default LoadingSpinner;
