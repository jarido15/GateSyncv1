import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  StatusBar,
  ScrollView,
  BackHandler,
  Alert,  // Add this import
} from 'react-native';
import { auth, db } from '../components/firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';

const ParentHomeScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [schedule, setSchedule] = useState([]); // Store schedule as an array
  const slideAnim = useRef(new Animated.Value(-400)).current;

  useEffect(() => {
    fetchStudentSchedule();

    // Handle back press event
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuVisible) {
        closeMenu();
        return true; // Prevent default back behavior when menu is open
      }

      // Prompt user with confirmation to exit the app
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            onPress: () => null,  // Do nothing on cancel
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => BackHandler.exitApp(),  // Exit the app on Yes
          },
        ],
        { cancelable: false }
      );

      return true; // Prevent default back behavior
    });

    // Cleanup event listener on component unmount
    return () => {
      backHandler.remove();
    };
  }, [menuVisible]);

  const fetchStudentSchedule = async () => {
    try {
      if (!auth.currentUser) return;
  
      // Get linked student UIDs where status is "accepted"
      const parentRef = collection(db, 'parent', auth.currentUser.uid, 'LinkedStudent');
      const linkedStudentQuery = query(parentRef, where('status', '==', 'accepted'));
      const linkedStudentSnapshot = await getDocs(linkedStudentQuery);
  
      if (linkedStudentSnapshot.empty) {
        console.log('No accepted students found');
        return;
      }
  
      const allSchedules = [];
      // Loop through linked students and fetch schedules
      for (const studentDoc of linkedStudentSnapshot.docs) {
        const studentData = studentDoc.data();
        const uid = studentData.uid;
  
        // Query schedules where studentUid matches
        const scheduleQuery = query(
          collection(db, 'schedules'),
          where('uid', '==', uid)
        );
        const scheduleSnapshot = await getDocs(scheduleQuery);
  
        if (!scheduleSnapshot.empty) {
          scheduleSnapshot.forEach((sched) => {
            allSchedules.push(sched.data()); // Add schedule to the array
          });
        }
      }
  
      setSchedule(allSchedules); // Update schedule state with all schedules
    } catch (error) {
      console.error('Error fetching student schedule:', error);
    }
  };
  

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
          <Image source={require('../images/menu.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Image source={require('../images/logo.png')} style={styles.logo} />
          <Image source={require('../images/GateSync.png')} style={styles.gatesync} />
        </View>
        <TouchableOpacity onPress={toggleProfileDropdown}>
          <Image source={require('../images/account.png')} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      {/* Sliding Menu */}
      <Modal visible={menuVisible} transparent={true} animationType="none" onRequestClose={closeMenu}>
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
              <TouchableOpacity onPress={() => navigateToPage('ParentLogin')} style={styles.menuOption}>
                <Text style={styles.menuOptionText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Profile Dropdown */}
      {profileDropdownVisible && (
        <Modal visible={profileDropdownVisible} animationType="fade" transparent={true} onRequestClose={closeProfileDropdown}>
          <TouchableOpacity style={styles.overlay} onPress={closeProfileDropdown} />
          <View style={styles.profileDropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateToPage('HelpScreen')}>
              <Text style={styles.dropdownText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateToPage('ParentLogin')}>
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Link Children Section */}
      <View style={styles.linkcontainer}>
        <TouchableOpacity onPress={() => navigateToPage('LinkChildren')}>
          <View style={styles.button}>
            <Image source={require('../images/parent_.png')} style={styles.parenticon} />
            <Image source={require('../images/relationship.png')} style={styles.relationicon} />
          </View>
        </TouchableOpacity>
        <Image source={require('../images/arrowright.png')} style={styles.arrowicon} />
        <Text style={styles.Text}> Link with Son / </Text>
        <Text style={styles.Text}> Daughter</Text>
      </View>

      {/* Class Schedule Section */}
      <View style={styles.schedcontainer}>
        <View style={styles.titlecontainer}>
          <Text style={styles.titleschedule}> Class Schedule</Text>
        </View>

        {/* Displaying schedule in table format */}
        <ScrollView contentContainerStyle={styles.scheduleTable}>
          {schedule.length > 0 ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Date</Text>
                <Text style={styles.tableHeaderText}>Time In</Text>
                <Text style={styles.tableHeaderText}>Time Out</Text>
              </View>
              {schedule.map((sched, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{sched.date}</Text>
                  <Text style={styles.tableCell}>{sched.timeIn}</Text>
                  <Text style={styles.tableCell}>{sched.timeOut}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.schedule}> No class schedule found</Text>
          )}
        </ScrollView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#BCE5FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
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
  },
  gatesync: {
    width: 100,
    height: 34,
    resizeMode: 'contain',
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
  linkcontainer: {
    width: '90%',
    height: 124,
    alignSelf: 'center',
    backgroundColor: '#cfe5ff',
    borderRadius: 21,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    top: '10%',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 21,
    height: 80,
    width: 100,
    top: 25,
    left: 20,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  parenticon: {
    width: 60,
    height: 42,
    top: 25,
    alignSelf: 'center',
  },
  relationicon: {
    width: 30,
    height: 25,
    left: 55,
    top: -35,
  },
  arrowicon: {
    top: -60,
    left: 115,
  },
  Text: {
    fontWeight: '800',
    fontSize: 20,
    color: '#2488e5',
    top: -125,
    left: 185,
  },
  schedcontainer: {
    width: '90%',
    height: 456,
    backgroundColor: '#BCE5FF',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    top: '14%',
    alignSelf: 'center',
    borderRadius: 21,
  },
  titlecontainer: {
    width: '95%',
    height: 60,
    backgroundColor: '#6B9BFA',
    alignSelf: 'center',
    borderRadius: 21,
    top: 10,
  },
  titleschedule: {
    alignSelf: 'center',
    fontWeight: '800',
    fontSize: 20,
    color: '#E9F3FF',
    top: 15,
  },
  scheduleTable: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E9F3FF',
    paddingVertical: 10,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    width: '30%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9F3FF',
  },
  tableCell: {
    fontSize: 16,
    color: '#666',
    width: '30%',
  },
  schedule: {
    fontSize: 15,
    alignSelf: 'center',
    color: '#9AA6B2',
    top: 120,
  },
});

export default ParentHomeScreen;
