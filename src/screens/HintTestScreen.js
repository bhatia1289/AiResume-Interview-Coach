/**
 * Hint Component Test
 * Test the AI hint functionality
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import HintComponent from '../components/HintComponent';

const HintTestScreen = () => {
    const [hint, setHint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const simulateHintRequest = async () => {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random success/error
        if (Math.random() > 0.3) {
            setHint("Try using a two-pointer approach. Start with one pointer at the beginning and another at the end of the array. Move the pointers towards each other based on the sum comparison.");
        } else {
            setError("Failed to get hint. Please try again.");
        }
        
        setLoading(false);
    };

    const clearHint = () => {
        setHint(null);
        setError(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Hint Test</Text>
            <Text style={styles.subtitle}>Test the new hint component functionality</Text>
            
            <View style={styles.buttonContainer}>
                <Button
                    title="Get AI Hint"
                    onPress={simulateHintRequest}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                />
                
                {hint && (
                    <Button
                        title="Clear Hint"
                        variant="outline"
                        onPress={clearHint}
                        style={styles.button}
                    />
                )}
            </View>

            <HintComponent
                hint={hint}
                loading={loading}
                error={error}
                onRetry={simulateHintRequest}
                visible={hint !== null || loading || error !== null}
                initiallyExpanded={true}
            />

            <View style={styles.featuresList}>
                <Text style={styles.featuresTitle}>Features Tested:</Text>
                <Text style={styles.featureItem}>✅ Expandable/Collapsible hint</Text>
                <Text style={styles.featureItem}>✅ Typing indicator animation</Text>
                <Text style={styles.featureItem}>✅ Error handling with retry</Text>
                <Text style={styles.featureItem}>✅ Loading states</Text>
                <Text style={styles.featureItem}>✅ Smooth animations</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    button: {
        flex: 1,
    },
    featuresList: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    featureItem: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
});

export default HintTestScreen;