import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../components/firebase'; // Ensure this imports your Firebase config

const ParentLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');  // Declare email state
  const [password, setPassword] = useState('');  // Declare password state

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Sign in the user with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      
      // Get the current authenticated user's UID
      const user = auth.currentUser;

      // Reference to the 'parent' document in Firestore using the UID
      const db = getFirestore();
      const parentDocRef = doc(db, 'parent', user.uid);
      const parentDocSnap = await getDoc(parentDocRef);

      // Check if the parent document exists in Firestore
      if (parentDocSnap.exists()) {
        // The user is a parent, navigate to the Parent Dashboard
        navigation.navigate('ParentPage');
      } else {
        // The user is not a parent
        Alert.alert('Login Failed', 'You are not registered as a parent.');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bluecircle} />
      <LinearGradient
        colors={['#5cb8ff', '#6b9bfa']}
        style={styles.bluecircle2}
      />
      <Text style={styles.heading}>Parent</Text>
      <Text style={styles.heading}>Login</Text>
      <TouchableOpacity onPress={() => navigation.navigate('LoginOption')}>
        <Image
          source={require('../images/arrow_back.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>
      <Image
        source={require('../images/facescanner.png')}
        style={styles.facescanner}
      />
      <Image
        source={require('../images/arrows.png')}
        style={styles.arrows1}
      />

      {/* Input Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={100}
      >
        <Text style={styles.ID}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}  // Set email correctly
          placeholderTextColor="#686D76"
        />
        <Text style={styles.password}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#686D76"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={ ()=> navigation.navigate('ParentForgotPassword')}>
        <Text style={styles.forgotpassword}>Forgot Password</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Text style={styles.haveacc}>Don't have an account?</Text>
      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate('ParentSignup')}
      >
        <Text style={styles.registerText}>Register here</Text>
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
  },
  heading: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
    top: '7%',
  },
  arrow: {
    width: 53,
    height: 49,
    position: 'absolute',
    top: -95,
    left: '-45%',
  },
  facescanner: {
    width: 57,
    height: 61,
    position: 'absolute',
    top: '2%',
    right: '80%',
  },
  arrows1: {
    width: 22,
    height: 19,
    position: 'absolute',
    top: '7%',
    right: '90%',
  },
  bluecircle: {
    position: 'absolute',
    width: 550,
    height: 550,
    borderRadius: 275,
    backgroundColor: '#0E2C6E',
    top: 80,
    left: 40,
  },
  bluecircle2: {
    position: 'absolute',
    width: 490,
    height: 880,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 340,
    top: 100,
    left: -45,
  },
  inputContainer: {
    width: '90%',
    padding: 20,
    height: 330,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 100,
    bottom: '-10%',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  ID: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 10,
  },
  password: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 10,
  },
  forgotpassword: {
    color: 'black',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'right',
    alignSelf: 'center',
    top: 10,
  },
  button: {
    backgroundColor: '#000',
    width: '95%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    bottom: 10,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  haveacc: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    top: '1%',
  },
  registerLink: {
    top: '1%',
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ParentLogin;
