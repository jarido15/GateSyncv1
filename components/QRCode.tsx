import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, NativeModules, 
  Platform, InteractionManager, AppState 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message'; // Import the Toast component

const ViewQRPage = ({ navigation }) => {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQRCodeData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in.');
        setLoading(false);
        return;
      }

      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data();

        if (studentData?.idNumber) {
          console.log('ID Number found:', studentData.idNumber);
          InteractionManager.runAfterInteractions(() => {
            setQrData(studentData.idNumber.toString());
          });
        } else {
          console.error('No ID Number field found.');
          setQrData('No ID Available');
        }
      } else {
        console.error('No matching document found for user email:', user.email);
        setQrData('User Not Found');
      }
    } catch (error) {
      console.error('Error fetching QR data:', error.message);
      setQrData('Error Loading');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchQRCodeData();
    }, [fetchQRCodeData])
  );

  useEffect(() => {
    if (Platform.OS === 'android' && NativeModules.PreventScreenshotModule) {
      const timer = setTimeout(() => {
        try {
          console.log('Enabling secure mode...');
          NativeModules.PreventScreenshotModule.enableSecureMode();
          Toast.show({
            type: 'success',
            text1: 'Screenshot prevention is enabled',
            position: 'bottom',
            visibilityTime: 2000,
          });
        } catch (error) {
          console.error('Failed to enable screenshot restriction:', error);
        }
      }, 3000); // Delay to prevent app crashes on initial render

      return () => {
        clearTimeout(timer);
        if (Platform.OS === 'android' && NativeModules.PreventScreenshotModule) {
          try {
            console.log('Disabling secure mode...');
            NativeModules.PreventScreenshotModule.disableSecureMode();
            Toast.show({
              type: 'success',
              text1: 'Screenshot prevention is disabled',
              position: 'bottom',
              visibilityTime: 2000,
            });
          } catch (error) {
            console.error('Failed to disable screenshot restriction:', error);
          }
        }
      };
    }

    // iOS: Prevent the content from appearing in the task switcher
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        console.log('App moved to background (possible screenshot prevention)');
      }
    });

    return () => {
      appStateListener.remove();
    };
  }, []);

  return (
    <>
      <LinearGradient colors={['#FFFFFF', '#84B4FC']} style={styles.container}>
        <StatusBar backgroundColor="#FFF" barStyle="light-content" />
        <LinearGradient colors={['#82D8FF', '#0040FF']} style={styles.contentContainer}>
          <View style={styles.Square}>
            {loading ? (
              <Text>Loading QR Code...</Text>
            ) : qrData ? (
              <QRCode value={qrData} size={200} />
            ) : (
              <Text>No QR Code Available</Text>
            )}
          </View>
          <Text style={styles.title}>Scan your entry code</Text>
        </LinearGradient>

        <TouchableOpacity style={styles.Button} onPress={() => navigation.navigate('StudentPage')}>
          <Text style={styles.return}>Dashboard</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Toast component */}
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 21, width: '80%', height: 464 },
  title: { fontSize: 24, fontWeight: '500', color: '#fff' },
  Button: { width: '60%', height: 63, backgroundColor: '#2C41FF', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  return: { fontSize: 20, fontWeight: '700', color: '#fff' },
  Square: { width: 233, height: 240, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
});

export default ViewQRPage;
