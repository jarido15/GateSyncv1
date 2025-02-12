import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert } from 'react-native';

const requestFCMToken = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      Alert.alert('FCM Token', token); // Display the token for debugging
    } else {
      console.log('Permission denied for notifications');
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

const App = () => {
  useEffect(() => {
    requestFCMToken();

    // Listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
    });

    return unsubscribe;
  }, []);

  return null; // Replace with your actual UI
};

export default App;
