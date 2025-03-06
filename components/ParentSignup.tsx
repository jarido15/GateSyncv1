import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Ensure Firebase is correctly imported


const ParentSignup = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
     const [passwordVisible, setPasswordVisible] = useState(false); // Added state

     const handleSignup = async () => {
        // Validate fields
        if (!username || !email || !password || !contactNumber) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
    
        // Validate username (must not contain numbers)
        const usernameRegex = /^[^\d]*$/; // Regex to check if username contains digits
        if (!usernameRegex.test(username)) {
            Alert.alert('Error', 'Username must not contain numbers');
            return;
        }
    
        // Validate email format (must be @gmail.com)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid Gmail address');
            return;
        }
    
        // Validate contact number (must be 11 digits)
        const contactNumberRegex = /^\d{11}$/;
        if (!contactNumberRegex.test(contactNumber)) {
            Alert.alert('Error', 'Contact number must be exactly 11 digits');
            return;
        }
    
        try {
            // Create user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Send email verification
            await sendEmailVerification(user);
            Alert.alert('Verification Email Sent', 'Please check your inbox to verify your email address.');
    
            // Store user data in Firestore using UID as the document ID
            await setDoc(doc(db, 'parent', user.uid), {
                username,
                email,
                contactNumber,
                uid: user.uid,
                createdAt: new Date().toISOString(),
            });
    
            Alert.alert('Success', `Welcome, ${username}! Please verify your email before logging in.`);
            navigation.navigate('ParentLogin');
        } catch (error) {
            Alert.alert('Signup Failed', error.message);
            console.error('Error signing up:', error);
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.bluecircle} />
            <LinearGradient colors={['#5cb8ff', '#6b9bfa']} style={styles.bluecircle2} />
            <Text style={styles.heading}>Parent</Text>
            <Text style={styles.heading}>Sign Up</Text>

            <Image source={require('../images/facescanner.png')} style={styles.facescanner} />
            <Image source={require('../images/arrows.png')} style={styles.arrows1} />
            <TouchableOpacity onPress={() => navigation.navigate('ParentLogin')}>
                <Image source={require('../images/arrow_back.png')} style={styles.arrow} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor={'#686D76'}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    placeholderTextColor={'#686D76'}
                />

                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Contact Number"
                    value={contactNumber}
                    onChangeText={(text) => setContactNumber(text.replace(/[^0-9]/g, ''))} // Allow only numbers
                    keyboardType="numeric"
                    placeholderTextColor={'#686D76'}
                />

                <Text style={styles.password}>Password</Text>
                        <View style={styles.passwordContainer}>
                          <TextInput
                            style={styles.inputPassword}
                            placeholder="Password"
                            secureTextEntry={!passwordVisible} // Corrected
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#686D76"
                          />
                          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                            <Image
                              source={
                                passwordVisible
                                  ? require('../images/visible.png') // Eye open
                                  : require('../images/eye.png') // Eye closed
                              }
                              style={styles.eyeImage}
                            />
                          </TouchableOpacity>
                        </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
        </View>
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
    heading: {
        fontSize: 48,
        fontWeight: '500',
        bottom: 570,
        color: '#fff',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 8,
    },
    arrow: {
        width: 53,
        height: 49,
        top: -800,
        right: 150,
    },
    facescanner: {
        width: 57,
        height: 61,
        top: -820,
        right: 150,
    },
    arrows1: {
        width: 22,
        height: 19,
        top: -840,
        right: 170,
    },
    bluecircle: {
        width: 550,
        height: 550,
        borderRadius: 270,
        backgroundColor: '#0E2C6E',
        left: 150,
        bottom: -800,
    },
    bluecircle2: {
        width: 490,
        height: 880,
        borderTopLeftRadius: 180,
        borderTopRightRadius: 340,
        backgroundColor: '#0E2C6E',
        left: 5,
        bottom: -255,
    },
    inputContainer: {
        width: '100%',
        height: 480, // Increased height to fit new input
        bottom: 680,
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
        top: -755,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        top: 8,
        fontWeight: 'bold',
    },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 15, backgroundColor: '#fff', paddingHorizontal: 15, marginBottom: 20 },
  inputPassword: { flex: 1, padding: 15, color: 'black' },
  eyeIcon: { padding: 10 },
  eyeImage: { width: 24, height: 24, tintColor: 'gray' },
  password: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 10,
  },
});

export default ParentSignup;
