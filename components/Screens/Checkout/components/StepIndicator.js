import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StepIndicator = ({ currentStep, steps }) => {
    return (
        <View style={styles.container}>
            <View style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <View key={index} style={styles.stepContainer}>
                        <View
                            style={[
                                styles.circle,
                                currentStep === index && styles.activeCircle,
                                step.completed && styles.completedCircle,
                            ]}>
                            <Text
                                style={[
                                    styles.stepNumber,
                                    (currentStep === index || step.completed) && styles.activeStepNumber,
                                ]}>
                                {index + 1}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.stepTitle,
                                currentStep === index && styles.activeStepTitle,
                                step.completed && styles.completedStepTitle,
                            ]}>
                            {step.title}
                        </Text>
                        {index < steps.length - 1 && <View style={[styles.line, step.completed && styles.completedLine]} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        zIndex: 1,
    },
    activeCircle: {
        backgroundColor: '#007BFF',
    },
    completedCircle: {
        backgroundColor: '#4CAF50',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#757575',
    },
    activeStepNumber: {
        color: '#FFFFFF',
    },
    stepTitle: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'center',
    },
    activeStepTitle: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    completedStepTitle: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    line: {
        position: 'absolute',
        height: 2,
        width: '100%',
        backgroundColor: '#E0E0E0',
        top: 15,
        left: '50%',
        zIndex: 0,
    },
    completedLine: {
        backgroundColor: '#4CAF50',
    },
}); 