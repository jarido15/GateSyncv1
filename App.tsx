/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import SplashScreen from './components/SplashScreen';
import GetStartedScreen from './components/GetStarted';
import LoginOption from './components/LoginOption';
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentSignup';
import ParentLogin from './components/ParentLogin';
import ParentSignup from './components/ParentSignup';
import StudentPage from './components/StudentPage';
import MessagesScreen from './components/MessagesScreen';
import QRCode from './components/QRCode';
import ActivityLogs from './components/ActivityLogs';
import LinkParent from './components/LinkParent';
import LinkedParent from './components/LinkedParent';
import ChatPage from './components/ChatPage';
import NotificationScreen from './components/NotificationScreen';
import EmergencyScreen from './components/EmrgencyScreen';
import ProfileScreen from './components/ProfileScreen';
import ParentHomeScreen from './components/ParentHomeScreen';
import ParentUpdate from './components/ParentUpdate';
import ParentMessage from './components/ParentMessage';
import ParentChatPage from './components/ParentChatPage';
import LinkChildren from './components/LinkChildren';
import LinkedChildren from './components/LinkedChildren';
import ScheduleScreen from './components/ScheduleScreen';
import Myschedule from './components/Myschedule';

import messaging from '@react-native-firebase/messaging';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db, app } from './components/firebase';
import ParentProfile from './components/ParentProfile';
import ForgotPassword from './components/ForgotPassword';
import ParentForgotPassword from './components/ParentForgotPassword';


// Create Stack and Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StudentPageTabs = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Query the students collection to find the document where the 'uid' matches the user
        const studentsRef = collection(db, 'students');
        const studentQuery = query(studentsRef, where('uid', '==', user.uid));
        const studentSnapshot = await getDocs(studentQuery);

        if (!studentSnapshot.empty) {
          const studentDoc = studentSnapshot.docs[0]; // Assuming UID is unique
          const linkedParentRef = collection(studentDoc.ref, 'LinkedParent');

          // Query for 'Pending' status in LinkedParent subcollection
          const q = query(linkedParentRef, where('status2', '==', 'Pending'));

          // Listen for real-time updates
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setPendingCount(querySnapshot.size); // Dynamically update count
          });

          return unsubscribe; // Return cleanup function
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };

    const unsubscribePromise = fetchPendingCount();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let imageSource;

          if (route.name === 'Home') {
            imageSource = focused
              ? require('./images/home(3).png')
              : require('./images/home(2).png');
          } else if (route.name === 'Messages') {
            imageSource = focused
              ? require('./images/customer1.png')
              : require('./images/customer2.png');
          } else if (route.name === 'Notification') {
            imageSource = focused
              ? require('./images/bell.png')
              : require('./images/bell1.png');
          }

          return (
            <View
              style={{
                width: 64,
                height: 32,
                backgroundColor: focused ? '#BCE5FF' : 'transparent',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Image
                source={imageSource}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: 'contain',
                }}
              />
              {/* Pending Count Badge */}
              {route.name === 'Notification' && pendingCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    {pendingCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#d3d3d3',
        tabBarStyle: {
          backgroundColor: '#5FA7FF',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={StudentPage} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
    </Tab.Navigator>
  );
};

const ParentPageTabs = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Query the parent collection to find the document where the 'uid' matches the user
        const parentsRef = collection(db, 'parent');
        const parentQuery = query(parentsRef, where('uid', '==', user.uid));
        const parentSnapshot = await getDocs(parentQuery);

        if (!parentSnapshot.empty) {
          const parentDoc = parentSnapshot.docs[0]; // Assuming UID is unique
          const linkedStudentRef = collection(parentDoc.ref, 'LinkedStudent');

          // Get all linked students from the LinkedStudent subcollection
          const linkedStudentSnapshot = await getDocs(linkedStudentRef);
          const linkedStudents = linkedStudentSnapshot.docs.map(doc => doc.data().idNumber);

          if (linkedStudents.length === 0) {
            setPendingCount(0); // No linked students, no pending count
            return;
          }

          // Query the scanned_ids collection where the idNumber matches any linked student
          const scannedIdsRef = collection(db, 'scanned_ids');
          const scannedIdsQuery = query(
            scannedIdsRef,
            where('idNumber', 'in', linkedStudents),  // Match the idNumber with linked students
            where('status', '==', 'Pending')         // Only consider pending status
          );

          // Listen for real-time updates for scanned_ids
          const unsubscribeScannedIds = onSnapshot(scannedIdsQuery, (scannedIdsSnapshot) => {
            const pendingScannedIdsCount = scannedIdsSnapshot.size;  // Get the number of pending scanned ids
            setPendingCount(pendingScannedIdsCount); // Set the pending count
          });

          // Cleanup the scanned_ids listener
          return () => unsubscribeScannedIds();
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };

    // Call the function to fetch the pending count
    fetchPendingCount();

  }, []); // Empty dependency array to run once when the component mounts

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let imageSource;

          if (route.name === 'Home') {
            imageSource = focused
              ? require('./images/home(3).png') // Active image for Home
              : require('./images/home(2).png'); // Inactive image for Home
          } else if (route.name === 'Messages') {
            imageSource = focused
              ? require('./images/customer1.png') // Active image for Messages
              : require('./images/customer2.png'); // Inactive image for Messages
          } else if (route.name === 'Notification') {
            imageSource = focused
              ? require('./images/bell.png') // Active image for Updates
              : require('./images/bell1.png'); // Inactive image for Updates
          }

          return (
            <View
            style={{
              width: 64,
              height: 32,
              backgroundColor: focused ? '#BCE5FF' : 'transparent',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Image
              source={imageSource}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
              }}
            />
            {/* Pending Count Badge */}
            {route.name === 'Notification' && pendingCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'red',
                  borderRadius: 10,
                  width: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                  {pendingCount}
                </Text>
              </View>
            )}
          </View>
          );
        },
        tabBarActiveTintColor: '#ffffff', // Active icon color (white)
        tabBarInactiveTintColor: '#d3d3d3', // Inactive icon color (light gray)
        tabBarStyle: {
          backgroundColor: '#5FA7FF',  // Background color for the tab bar
          borderTopLeftRadius: 20, // Optional: rounded corners
          borderTopRightRadius: 20, // Optional: rounded corners
          height: 60, // Adjust tab bar height if needed
        },
        headerShown: false, // Hide headers for tab screens
      })}
    >
      <Tab.Screen name="Home" component={ParentHomeScreen} />
      <Tab.Screen name="Messages" component={ParentMessage} />
      <Tab.Screen name="Notification" component={ParentUpdate} />
    </Tab.Navigator>
  );
};





// Main App Component
const App = () => {
  useEffect(() => {
    if (app) {
      console.log('Firebase Initialized!');
      
      async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
        if (enabled) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      }
  
      requestUserPermission();
    } else {
      console.log('Firebase not initialized!');
    }
  }, []);
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Get Started" component={GetStartedScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginOption" component={LoginOption} options={{ headerShown: false }} />
          <Stack.Screen name="StudentLogin" component={StudentLogin} options={{ headerShown: false }} />
          <Stack.Screen name="StudentSignup" component={StudentSignup} options={{ headerShown: false }} />
          <Stack.Screen name="ParentLogin" component={ParentLogin} options={{ headerShown: false }} />
          <Stack.Screen name="ParentSignup" component={ParentSignup} options={{ headerShown: false }} />
          <Stack.Screen name="QRCode" component={QRCode} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="ParentForgotPassword" component={ParentForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="Myschedule" component={Myschedule} options={{ headerShown: false }} />
          <Stack.Screen name="ActivityLogs" component={ActivityLogs} options={{ headerShown: false }} />
          <Stack.Screen name="LinkParent" component={LinkParent} options={{ headerShown: false }} />
          <Stack.Screen name="LinkedParent" component={LinkedParent} options={{ headerShown: false }} />
          <Stack.Screen name="LinkChildren" component={LinkChildren} options={{ headerShown: false }} />
          <Stack.Screen name="LinkedChildren" component={LinkedChildren} options={{ headerShown: false }} />
          <Stack.Screen name="ChatPage" component={ChatPage} options={{ headerShown: false }} />
          <Stack.Screen name="ParentChatPage" component={ParentChatPage} options={{ headerShown: false }} />
          <Stack.Screen name="EmergencyScreen" component={EmergencyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ParentProfile" component={ParentProfile} options={{ headerShown: false }} />
          <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} options={{ headerShown: false }} />
          <Stack.Screen name="StudentPage" component={StudentPageTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ParentPage" component={ParentPageTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;