/* eslint-disable quotes */
import 'react-native-get-random-values'; // Polyfill for crypto
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg'; // Import QR Code generator
import { getDoc, doc } from 'firebase/firestore'; // For fetching data from Firestore
import { auth, db } from './firebase'; // Your Firebase configuration
import { collection, query, where, getDocs } from 'firebase/firestore'; // Ensure Firestore functions are imported

const ViewQRPage = ({ navigation }) => {
  const [qrData, setQrData] = useState('');  // State to hold QR data
  
  useEffect(() => {
    const fetchQRCodeData = async () => {
      try {
        const user = auth.currentUser; // Get current user
        if (!user) {
          console.log("No user logged in.");
          return;
        }
  
        // Reference the "students" collection
        const studentsRef = collection(db, "students");
        
        // Query to find the student document where email matches the logged-in user's email
        const q = query(studentsRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0]; // Get the first matched document
          const studentData = studentDoc.data();
          if (studentData && studentData.idNumber) {
            console.log("ID Number found:", studentData.idNumber);
            setQrData(studentData.idNumber); // Set idNumber as QR code data
          } else {
            console.error("No ID Number field found in the document.");
          }
        } else {
          console.error("No matching document found for user email:", user.email);
        }
      } catch (error) {
        console.error("Error fetching QR data:", error.message);
      }
    };
  
    fetchQRCodeData();
  }, []); // Runs only once when component mounts
  
  return (
    <LinearGradient
      colors={['#FFFFFF', '#84B4FC']} // Gradient background for the full page
      style={styles.container}
    >
      <StatusBar backgroundColor="#fFF" barStyle="light-content" />
      <LinearGradient
        colors={['#82D8FF', '#0040FF']} // Gradient colors for content container
        style={styles.contentContainer}
      >
        {/* QR code container */}
        <View style={styles.Square}>
          {qrData ? (
            <QRCode
              value={qrData} // Pass the dynamic QR data
              size={200} // Adjust size as needed
            />
          ) : (
            <Text>Loading QR Code...</Text>  // Show loading text until QR data is available
          )}
        </View>
        <Text style={styles.title}>Scan your entry code</Text>
      </LinearGradient>

      {/* Return to Dashboard Button */}
      <TouchableOpacity
        style={styles.Button}
        onPress={() => navigation.navigate('StudentPage')} // Correct placement of onPress
      >
        <Text style={styles.return}>Dashboard</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  contentContainer: {
    alignItems: 'center', // Align items in the center
    justifyContent: 'center', // Align items in the center
    padding: 20,
    borderRadius: 21,
    width: '80%', // Ensure it takes up some space, adjust as needed
    height: 464, // Set a specific height
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: '#fff', // Color for the title
    bottom: '-10%',
  },
  Button: {
    width: '60%',
    height: 63,
    backgroundColor: '#2C41FF',
    borderRadius: 15,
    alignItems: 'center', // Center text inside the button
    justifyContent: 'center',
    marginTop: 20, // Adjusted for spacing
  },
  return: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: '#fff', // Color for the title
  },
  Square: {
    width: 233,
    height: 240,
    backgroundColor: '#fff',
    justifyContent: 'center', // Center QR code inside the square
    alignItems: 'center',
    marginBottom: 20, // Adds space between QR code and title
  },
});

export default ViewQRPage;
