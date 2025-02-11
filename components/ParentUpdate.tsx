import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ParentUpdate = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false); // State to control menu modal visibility
    const [notifications, setNotifications] = useState([]); // Array to hold notifications
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

    const navigateToPage = (page) => {
        setMenuVisible(false); // Close the menu
        navigation.navigate(page); // Navigate to the selected page
    };

    return (
        <>
            <ScrollView style={styles.container}>
            <StatusBar backgroundColor="#BCE5FF" barStyle="light-content" />
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
                </View>

                <View style={styles.content}>
                    <LinearGradient colors={['#6B9BFA', '#0056FF']} style={styles.notif} />
                    <Image source={require('../images/Updates.png')} style={styles.notificon} />
                    <Text style={styles.noitfText}>Notifications</Text>
                    <Text style={styles.noitfText}>List</Text>
                    {/* Conditionally render the No Notifications message or the notifications list */}
                    {notifications.length === 0 ? (
                        <Text style={styles.noNotificationText}>No Notifications</Text>
                    ) : (
                        notifications.map((notif, index) => (
                            <Text key={index} style={styles.notificationText}>
                                {notif}
                            </Text>
                        ))
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={menuVisible}
                animationType="none"
                transparent={true}
                onRequestClose={closeMenu}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.overlay} onPress={closeMenu} />

                    <Animated.View style={[styles.slideMenu, { transform: [{ translateX: slideAnim }] }]}>
                        <View style={styles.menu}>
                            <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigateToPage('LinkedChildren')} style={styles.menuOption}>
                                <Text style={styles.menuOptionText}>Linked Children</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => console.log('Settings Pressed')} style={styles.menuOption}>
                                <Text style={styles.menuOptionText}>Settings</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigateToPage('StudentLogin')} style={styles.menuOption}>
                                <Text style={styles.menuOptionText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
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
        left: '-60%',
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
        left: '-60%',
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
        fontFamily: 'Kanit',
        color: '#5394F2',
        top: -30,
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
      notif:{
        width: '100%',
        height: 130,
        borderRadius:21 ,
        alignSelf: 'center',
        top: '-1%',
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
      },
      notificon:{
        width: 150,
        height: 160,
        left: '53%',
        top: '-43%',
      },
      noitfText:{
        fontSize: 25,
        fontFamily: 'MartianMono-Regular',
        color: '#fff',
        fontWeight: '800',
        top: '-68%',
        left: '8%',
      },
      noNotificationText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    notificationText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        paddingVertical: 5,
    },
});

export default ParentUpdate;
