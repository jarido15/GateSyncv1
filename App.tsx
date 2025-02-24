/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';
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
import { app } from './components/firebase';  // Correctly import the app
import ParentProfile from './components/ParentProfile';
import ForgotPassword from './components/ForgotPassword';
import ParentForgotPassword from './components/ParentForgotPassword';


// Create Stack and Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Student Page Tabs
const StudentPageTabs = () => (
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
              width: 64,  // Rectangle width
              height: 32, // Rectangle height
              backgroundColor: focused ? '#BCE5FF' : 'transparent', // Background color when active
              borderRadius: 16, // Rounded corners
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={imageSource}
              style={{
                width: 20,  // Adjust width of image inside the rectangle
                height: 20, // Adjust height of image inside the rectangle
                resizeMode: 'contain', // Makes the image maintain aspect ratio
              }}
            />
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
    <Tab.Screen name="Home" component={StudentPage} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Notification" component={NotificationScreen} />
  </Tab.Navigator>
);

// Parent Page Tabs
const ParentPageTabs = () => (
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
              width: 64,  // Rectangle width
              height: 32, // Rectangle height
              backgroundColor: focused ? '#BCE5FF' : 'transparent', // Background color when active
              borderRadius: 16, // Rounded corners
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={imageSource}
              style={{
                width: 20,  // Adjust width of image inside the rectangle
                height: 20, // Adjust height of image inside the rectangle
                resizeMode: 'contain', // Makes the image maintain aspect ratio
              }}
            />
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