import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  StatusBar,
} from 'react-native';

const ParentHomeScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-400)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownVisible(!profileDropdownVisible);
  };

  const closeProfileDropdown = () => {
    setProfileDropdownVisible(false);
  };

  const navigateToPage = (page) => {
    closeMenu();
    navigation.navigate(page);
  };

  return (
    <View style={styles.container}>
       <StatusBar backgroundColor="#BCE5FF" barStyle="light-content" />
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={openMenu}>
          <Image
            source={require('../images/menu.png')}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Image
            source={require('../images/logo.png')}
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

      {/* Sliding Menu */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
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

      {/* Profile Dropdown */}
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
              onPress={() => {
                closeProfileDropdown();
                navigation.navigate('HelpScreen');
              }}
            >
              <Text style={styles.dropdownText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => navigateToPage('ParentLogin')}
            >
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      <View style={styles.linkcontainer}>
        <TouchableOpacity onPress={() => navigateToPage('LinkChildren')} >
        <View style={styles.button}>
        <Image source={require('../images/parent_.png')} style={styles.parenticon}/>
        <Image source={require('../images/relationship.png')} style={styles.relationicon}/>
        </View>
        </TouchableOpacity>
        <Image source={require('../images/arrowright.png')} style={styles.arrowicon}/>
        <Text style={styles.Text}> Link with Son / </Text>
        <Text style={styles.Text}> Daughter</Text>
      </View>

      <View style={styles.schedcontainer}>
        <View style={styles.titlecontainer}>
          <Text style={styles.titleschedule}> Class Schedule</Text>
        </View>
        <Text style={styles.schedule}> No class schedule found</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  navbar: {
    position: 'absolute', // Make the navbar fixed at the top
    top: 0, // Align to the top of the screen
    left: 0,
    right: 0,
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
    zIndex: 1000, // Ensure it appears above other elements
  },
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 34,
    resizeMode: 'contain',
    marginRight: 10,
    left: 6,
  },
  gatesync: {
    width: 100,
    height: 34,
    resizeMode: 'contain',
    top: 5,
    left: 6,
  },
  menuIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  profileIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    flex: 1,
  },
  slideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    backgroundColor: '#fff',
    height: '100%',
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  linkcontainer:{
    width: '90%',
    height: 124,
    alignSelf: 'center',
    backgroundColor:'#cfe5ff',
    borderRadius: 21,
    shadowColor: 'black', // Shadow color (iOS)
    shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
    shadowOpacity: 0.3, // Shadow opacity (iOS)
    shadowRadius: 4, // Shadow radius (iOS)
    elevation: 5, // Shadow for Android
    top: '10%',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 21,
    height: 80,
    width: 100,
    top: 25,
    left: 20,
    shadowColor: 'black', // Shadow color (iOS)
    shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
    shadowOpacity: 0.3, // Shadow opacity (iOS)
    shadowRadius: 4, // Shadow radius (iOS)
    elevation: 5, // Shadow for Android
  },
  parenticon: {
    width: 60,
    height: 42,
    top: 25,
    alignSelf: 'center',
  },
  relationicon:{
    width: 30,
    height: 25,
    left: 55,
    top: -35,
  },
  arrowicon:{
    top: -60,
    left: 115,
  },
  Text: {
    fontWeight: '800',
    fontSize: 20,
    fontFamily: 'Kanit-Regular',
    color: '#2488e5',
    top: -125,
    left: 185,
  },
  schedcontainer:{
    width: '90%',
    height: 456,
    backgroundColor: '#BCE5FF',
    shadowColor: 'black', // Shadow color (iOS)
    shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
    shadowOpacity: 0.3, // Shadow opacity (iOS)
    shadowRadius: 4, // Shadow radius (iOS)
    elevation: 5, // Shadow for Android
    top: '14%',
    alignSelf: 'center',
    borderRadius: 21,
  },
  titlecontainer:{
    width: '95%',
    height: 60,
    backgroundColor: '#6B9BFA',
    alignSelf: 'center',
    borderRadius: 21,
    top: 10,
  },
  titleschedule:{
    alignSelf: 'center',
    fontFamily: 'Kanit-Regular',
    fontWeight: '800',
    fontSize: 20,
    color: '#E9F3FF',
    top: 15,
  },
  schedule:{
    fontSize: 15,
    alignSelf: 'center',
    color: '#9AA6B2',
    top: 120,
  },
});

export default ParentHomeScreen;
