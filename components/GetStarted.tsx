import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const GetStartedScreen = ({ navigation }) => {
    useEffect(() => {
        const checkIfFirstLaunch = async () => {
            const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
            if (hasSeenIntro) {
                navigation.replace('LoginOption'); // Redirect if already seen
            }
        };
        checkIfFirstLaunch();
    }, []);

    const handleGetStarted = async () => {
        await AsyncStorage.setItem('hasSeenIntro', 'true'); // Store the flag
        navigation.replace('LoginOption'); // Navigate to the next screen
    };

    return (
        <LinearGradient
            colors={['#2f3ead', '#5cb8ff']}
            style={styles.container}
        >
            <StatusBar backgroundColor="#2F3EAD" barStyle="light-content" />

            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            <Image source={require('../images/facescanner.png')} style={styles.image} />
            <Image source={require('../images/arrows.png')} style={styles.imagearrow} />
            <Image source={require('../images/GateSync.png')} style={styles.imageGS} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    image: {
        width: 211,
        height: 182,
        bottom: 110,
        left: 90,
        marginBottom: 20,
    },
    imageGS: {
        width: 195,
        height: 50,
        bottom: 120,
        left: 90,
    },
    imagearrow: {
        width: 80,
        height: 70,
        position: 'absolute',
        top: 290,
        left: 90,
    },
    button: {
        backgroundColor: '#0E2C6E',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#fff',
        width: 203,
        height: 55,
        top: 200,
        left: 95,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Kanit-SemiBold',
    },
});

export default GetStartedScreen;
