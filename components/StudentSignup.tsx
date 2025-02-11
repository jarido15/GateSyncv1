import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Modal, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth
import { db, auth } from './firebase'; // Firebase Auth and Firestore
import { collection, addDoc } from 'firebase/firestore'; // Firestore
import QRCode from 'react-native-qrcode-svg'; // QR Code Library

const StudentSignup = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [course, setCourse] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [qrData, setQrData] = useState(''); // For storing QR code data

    const handleSignup = async () => {
        // Validate fields
        if (!username || !email || !password || !idNumber || !yearLevel || !course) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
    
        try {
            // Step 1: Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Step 2: Prepare QR code data (e.g., ID number or unique identifier)
            const qrDataString = `${username}-${idNumber}`; // Example: "JohnDoe-123456"
            setQrData(qrDataString);
    
            // Step 3: Save user details and QR code data to Firestore (with 'uid')
            await addDoc(collection(db, 'students'), {
                username,
                email,
                idNumber,
                yearLevel,
                course,
                qrData: qrDataString, // Save QR code data
                uid: user.uid, // Store the signed-in user's UID
            });
    
            // Step 4: Show success modal
            setModalVisible(true);
        } catch (error) {
            console.error('Error signing up:', error.message);
            Alert.alert('Error', 'An error occurred while signing up. Please try again.');
        }
    };

    

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.inner}>
                    <View style={styles.bluecircle} />
                    <LinearGradient
                        colors={['#5cb8ff', '#6b9bfa']}
                        style={styles.bluecircle2}
                    />

                    <Text style={styles.heading}>Sign Up</Text>

                    <Image
                        source={require('../images/facescanner.png')} 
                        style={styles.facescanner}
                    />
                    <Image
                        source={require('../images/arrows.png')}
                        style={styles.arrows1}
                    />
                    <TouchableOpacity onPress={() => navigation.navigate('StudentLogin')}>
                        <Image
                            source={require('../images/arrow_back.png')}
                            style={styles.arrow}
                        />
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


                        <View style={styles.row}>
                            <View style={styles.inputHalf}>
                                <Text style={styles.label}>ID Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter ID Number"
                                    value={idNumber}
                                    onChangeText={setIdNumber}
                                    placeholderTextColor={'#686D76'}
                                />
                            </View>
                            <View style={styles.inputHalf}>
                                <Text style={styles.label}>Year Level</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Year Level"
                                    value={yearLevel}
                                    onChangeText={setYearLevel}
                                    placeholderTextColor={'#686D76'}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Course</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Course"
                            value={course}
                            onChangeText={setCourse}
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

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor={'#686D76'}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Image
                                    source={require('../images/Check.png')} // Replace with your custom image
                                    style={styles.modalImage}
                                />
                                <Text style={styles.modalTitle}>Registration Successful!</Text>
                                <Text style={styles.modalMessage}>Welcome, {username}! You have successfully registered.</Text>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        navigation.navigate('StudentLogin');
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Go to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
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
        bottom: 610,
        color: '#fff',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 8,
    },
    arrow: {
        width: 53,
        height: 49,
        top: -735,
        right: 150,
    },
    facescanner: {
        width: 57,
        height: 61,
        top: -730,
        right: 150,
    },
    arrows1: {
        width: 22,
        height: 19,
        top: -750,
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
        height: 570,
        bottom: 730,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputHalf: {
        width: '48%', // 48% to leave some space between inputs
    },
    button: {
        backgroundColor: '#000',
        width: '85%',
        height: 43,
        top: '-110%',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 5,
    },
    modalImage: {
        width: 117,
        height: 110,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#5cb8ff',
        padding: 10,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default StudentSignup;
