import React, { useEffect } from 'react';  // Import useEffect
import { StyleSheet, Image, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Get Started'); // Navigate directly to Get Started screen
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);  // Ensure onFinish is a dependency

    return (
        <LinearGradient
            colors={['#2f3ead', '#5cb8ff']}
            style={styles.container}
        >
              <StatusBar backgroundColor="#2F3EAD" barStyle="light-content" />

            <Image
                source={require('../images/facescanner.png')} 
                style={styles.image}
            />
            <Image
                source={require('../images/arrows.png')} 
                style={styles.imagearrow}
            />
            <Image
                source={require('../images/GateSync.png')} 
                style={styles.imageGS}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 211,
        height: 182,
        marginBottom: 20,
    },
    imageGS: {
        width: 195,
        height: 50,
        top: 20,
    },
    imagearrow: {
        width: 80,
        height: 70,
        position: 'absolute',
        top: 402,
        left: 104,
    },
});

export default SplashScreen;
