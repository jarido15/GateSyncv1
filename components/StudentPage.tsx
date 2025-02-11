/* eslint-disable no-trailing-spaces */
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const StudentDashboard = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false); // State to control menu modal visibility
    const [profileDropdownVisible, setProfileDropdownVisible] = useState(false); // State for profile dropdown visibility
    const slideAnim = useRef(new Animated.Value(-400)).current; // Initial position of the modal (off-screen to the left)


    const openMenu = () => {
      setMenuVisible(true); // Show the modal
      Animated.timing(slideAnim, {
        toValue: 0, // Slide into the screen from the left
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  
    const closeMenu = () => {
      Animated.timing(slideAnim, {
        toValue: -400, // Slide back off-screen to the left
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false)); // Hide modal after animation
    };
  
    const toggleProfileDropdown = () => {
      setProfileDropdownVisible(!profileDropdownVisible);
  };

  const closeProfileDropdown = () => {
      setProfileDropdownVisible(false);
  };

    const navigateToPage = (page: string) => {
      setMenuVisible(false); // Close the menu
      navigation.navigate(page); // Navigate to the selected page
    };


  return (
    <>
      {/* Main ScrollView */}
      <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#BCE5FF" barStyle="light-content" />
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={openMenu}>
            <Image
              source={require('../images/menu.png')} // Replace with your burger menu image path
              style={styles.menuIcon}
            />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Image
              source={require('../images/logo.png')} // Replace with your logo image path
              style={styles.logo}
            />
            <Image source={require('../images/GateSync.png')} style={styles.gatesync} />
          </View>
          <TouchableOpacity onPress={toggleProfileDropdown}>
                        <Image
                            source={require('../images/account.png')}
                            style={styles.profileIcon}
                        />
                    </TouchableOpacity>
        </View>

        {/* QR Code Button */}
        <TouchableOpacity onPress={() => navigation.navigate('QRCode')}>
          <LinearGradient colors={['#6B9BFA', '#0056FF']} style={styles.qrbutton}>
            <Image source={require('../images/QR.png')} style={styles.QRcode} />
            <Text style={styles.scanqr}> View</Text>
            <Text style={styles.scanqr}> Your QR </Text>
            <Text style={styles.scanqr}> Code. </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Other Widgets and Buttons */}
        <View style={styles.widget}>
          <TouchableOpacity
            style={styles.widgetbutton}
            onPress={() => navigation.navigate('LinkParent')}
          >
            <Image source={require('../images/parent_.png')} style={styles.parent} />
            <Image source={require('../images/relationship.png')} style={styles.relationship} />
          </TouchableOpacity>
          <Image source={require('../images/arrowright.png')} style={styles.arrowright} />
          <Text style={styles.linkparent}> Link with</Text>
          <Text style={styles.linkparent}> Parents</Text>

          <View style={styles.line} />

          <TouchableOpacity
            style={styles.widgetbutton2}
            onPress={() => navigation.navigate('ActivityLogs')}
          >
            <Image source={require('../images/logs.png')} style={styles.logicon} />
          </TouchableOpacity>
          <Image source={require('../images/arrowleft.png')} style={styles.arrowleft} />
          <Text style={styles.logs}>Activity</Text>
          <Text style={styles.logs}>Logs</Text>
        </View>

          {/* Emergency Leave Button */}
      <TouchableOpacity style={styles.leave} onPress={() => navigation.navigate('EmergencyScreen')}>
        <Image source={require('../images/exit.png')} style={styles.exiticon} />
        <Text style={styles.emergency}>Emergency</Text>
        <Text style={styles.emergency}>Leave?</Text>
      </TouchableOpacity>


         {/* Emergency Leave Button */}
         <TouchableOpacity style={styles.class} onPress={() => navigation.navigate('ScheduleScreen')}>
        <Image source={require('../images/add-schedule.png')} style={styles.schedicon} />
        <Text style={styles.schedule}>Add</Text>
        <Text style={styles.schedule}>Schedule</Text>
      </TouchableOpacity>


        <View style={styles.content}>
          <Text style={styles.welcomeText}>Dashboard</Text>
        </View>
      </ScrollView>

      <Modal
        visible={menuVisible}
        animationType="none" // Disable default animation
        transparent={true}
        onRequestClose={closeMenu} // Handle back button press
      >
        <View style={styles.modalContainer}>
          {/* Overlay for dismissing the modal */}
          <TouchableOpacity style={styles.overlay} onPress={closeMenu} />

          {/* Animated sliding menu */}
          <Animated.View style={[styles.slideMenu, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.menu}>
              {/* Close button */}
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>

              {/* Menu Options */}
              <TouchableOpacity onPress={() => navigateToPage('QRCode')} style={styles.menuOption}>
                <Text style={styles.menuOptionText}>QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToPage('ActivityLogs')} style={styles.menuOption}>
                <Text style={styles.menuOptionText}>Activity Logs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToPage('LinkedParent')} style={styles.menuOption}>
                <Text style={styles.menuOptionText}>Linked Parent</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToPage('Myschedule')} style={styles.menuOption}>
                <Text style={styles.menuOptionText}>My Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToPage('StudentLogin')} style={styles.menuOption}>
          <Text style={styles.menuOptionText}>Logout</Text>
        </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {profileDropdownVisible && (
                <Modal
                    visible={profileDropdownVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={closeProfileDropdown}
                >
                    <TouchableOpacity
                        style={styles.overlay}
                        onPress={closeProfileDropdown}
                    />
                    <View style={styles.profileDropdown}>
                    <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => navigation.navigate('ProfileScreen')}
                      >
                          <Text style={styles.dropdownText}>Profile</Text>
                      </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => navigateToPage('StudentLogin')}
                        >
                            <Text style={styles.dropdownText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}

    </>
  );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#BCE5FF', // Background color for the navigation bar
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    navCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewqr: {
        width: '90%',
        height: 61,
        borderRadius: 21,
        backgroundColor: '#6b9bfa',
        justifyContent: 'center',
        top: '-50%',
        alignSelf: 'center',
        // Shadow for iOS
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Offset for shadow
        shadowOpacity: 0.3, // Opacity of the shadow
        shadowRadius: 4, // Blur radius of the shadow
        // Shadow for Android
        elevation: 6, // Elevation level for Android
    },
    leave:{
        width: '42%',
        height: 80,
        backgroundColor: '#0E46A3',
        marginTop: 10,
        top: '15.6%',
        left: '5%',
        borderRadius: 21,
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    exiticon:{
        width: 45,
        height: 43,
        right: '-70%',
        top: '25%',
    },
    emergency: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 2,
        fontFamily: 'Kanit-SemiBold',
        fontWeight: '900',
        right: '-7%',
        top: '-25%',
    },
    class:{
      width: '42%',
      height: 80,
      backgroundColor: '#08C2FF',
      marginTop: 10,
      top: '4%',
      left: '53%',
      borderRadius: 21,
      shadowColor: 'black', // Shadow color (iOS)
      shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
      shadowOpacity: 0.3, // Shadow opacity (iOS)
      shadowRadius: 4, // Shadow radius (iOS)
      elevation: 5, // Shadow for Android
  },
  schedicon:{
      width: 45,
      height: 43,
      right: '-70%',
      top: '25%',
  },
  schedule: {
      color: '#fff',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 3,
      fontFamily: 'Kanit-SemiBold',
      fontWeight: '900',
      right: '-7%',
      top: '-25%',
  },
    line:{
        width: '90%',
        height: 3,
        alignSelf: 'center',
        backgroundColor: '#6B9BFA',
        top: '-35%',
    },
    viewqrcode: {
        fontFamily: 'Kanit-SemiBold',
        fontSize: 20,
        color: '#fff',
        fontWeight: '900',
        alignSelf: 'center',
    },
    widget: {
        width: '90%',
        height: 250,
        backgroundColor: '#CFE5FF',
        marginTop: 10,
        top: '13%',
        alignSelf: 'center',
        borderRadius: 21,
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    widgetbutton: {
        width: 90,
        height: 80,
        backgroundColor: '#FFF',
        top: '10%',
        left: '7%',
        borderRadius: 21,
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    widgetbutton2: {
        width: 90,
        height: 80,
        backgroundColor: '#FFF',
        top: '-30%',
        right: '-63%',
        borderRadius: 21,
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    parent:{
        width: 60,
        height: 40,
        right: '-15%',
        top: '30%',
    },
    logicon:{
        width: 65,
        height: 63,
        right: '-13%',
        top: '10%',
    },
    relationship:{
        width: 31,
        height: 25.59,
        right: '-55%',
        top: '-40%',
    },
    arrowright:{
        width: 87.5,
        height: 82.49,
        right: '-35%',
        top: '-23%',
    },
    arrowleft:{
        width: 87.5,
        height: 82.49,
        right: '-35%',
        top: '-63%',
    },
    linkparent:{
        color: '#2488E5',
        fontSize: 24,
        lineHeight: 29,
        letterSpacing: 3,
        fontFamily: 'Kanit-SemiBold',
        fontWeight: '900',
        right: '-55%',
        top: '-51%',
    },
    logs:{
        color: '#2488E5',
        fontSize: 24,
        lineHeight: 29,
        letterSpacing: 3,
        fontFamily: 'Kanit-SemiBold',
        fontWeight: '900',
        right: '-7%',
        top: '-92%',
    },
    qrbutton:{
        width: '90%',
        height: 170,
        borderRadius:21 ,
        alignSelf: 'center',
        top: '49%',
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    QRcode:{
        width: 216.68,
        height: 197.77,
        left: '40%',
        top: '-30%',
    },
    scanqr:{
        fontSize: 25,
        fontFamily: 'MartianMono-Regular',
        color: '#fff',
        fontWeight: '800',
        top: '-100%',
        left: '8%',
    },
    logo: {
        width: 35, // Adjust logo size
        height: 34, // Adjust logo size
        resizeMode: 'contain', // Keep the aspect ratio of the logo
        marginRight: 10, // Space between logo and text
        shadowColor: '#000', // Shadow color (iOS)
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    gatesync: {
        width: 100, // Adjust logo size
        height: 34, // Adjust logo size
        top: 5, 
        resizeMode: 'contain', // Keep the aspect ratio of the logo
        marginRight: 10, // Space between logo and text
        shadowColor: '#000', // Shadow color (iOS)
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    menuIcon: {
        width: 30, // Adjust menu icon size
        height: 30, // Adjust menu icon size
        resizeMode: 'contain',
    },
    navbarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // Text color
    },
    profileIcon: {
        width: 30, // Adjust profile icon size
        height: 30, // Adjust profile icon size
        resizeMode: 'contain',
    },
    content: {
        marginTop: 20,
        padding: 20,
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#5394F2',
        top: -640,
        fontFamily: 'Kanit-SemiBold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        justifyContent: 'flex-start',
      },
      overlay: {
        flex: 1,
        width: '100%',
      },
      slideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '80%', // Adjust the width as needed
        backgroundColor: '#fff',
        height: '100%',
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Shadow for Android
      },
      menu: {
        flex: 1,
      },
      closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
      },
      closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
      menuOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      },
      menuOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
      },
      profileDropdown: {
        position: 'absolute',
        top: 70,
        right: 10,
        width: 150,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 999, // Ensure it appears above other elements
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
});

export default StudentDashboard;
