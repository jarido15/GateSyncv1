import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth'; // Firebase Auth
import { auth } from './firebase'; // Firebase Auth

const ForgotPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Check Your Email', 'A password reset link has been sent to your email address.');
            navigation.navigate('StudentLogin'); // Navigate back to login page after successful email sent
        } catch (error) {
            console.error('Error resetting password:', error.message);
            Alert.alert('Error', 'An error occurred while sending the reset email. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.inner}>
                    <Text style={styles.heading}>Forgot Password</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor={'#686D76'}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('StudentLogin')}>
                        <Text style={styles.goBackText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    heading: {
        fontSize: 38,
        fontWeight: '500',
        color: '#0E2C6E',
        marginBottom: 20,
    },
    inputContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    label: {
        color: 'black',
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#000',
        width: '85%',
        height: 43,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    goBackText: {
        fontSize: 16,
        color: '#0E2C6E',
        marginTop: 10,
    },
});

export default ForgotPassword;
