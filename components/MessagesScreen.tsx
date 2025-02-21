import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Animated, StatusBar } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../components/firebase'; // Assuming you've already set up the Firebase config
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';


const MessageScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [messages, setMessages] = useState({}); // Store messages by chatId
  const slideAnim = useRef(new Animated.Value(-400)).current;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;
  
        const { uid } = currentUser;  // Get the logged-in user's UID
        console.log("Logged-in User UID:", uid); // Log the logged-in user's UID for debugging
  
        // Fetch the student's data for the logged-in user
        const studentsRef = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        let linkedParents = [];
        const parentIds = new Set();  // Set to track unique parent IDs
  
        // Find the logged-in student's document based on their UID
        const loggedInStudent = studentsSnapshot.docs.find(
          (doc) => doc.data().uid === uid
        );
  
        if (loggedInStudent) {
          console.log("Logged-in Student found:", loggedInStudent.id);
  
          // Query the LinkedParent subcollection for the logged-in student
          const linkedParentRef = collection(db, 'students', loggedInStudent.id, 'LinkedParent');
          const linkedParentSnapshot = await getDocs(linkedParentRef);
  
          // Use a for...of loop to handle async operations properly
          for (const parentLinkedDoc of linkedParentSnapshot.docs) {
            if (parentLinkedDoc.exists()) {
              const linkedParentData = parentLinkedDoc.data();
  
              // Now fetch the parent document from the 'parent' collection
              const parentRef = query(
                collection(db, 'parent'),
                where('uid', '==', linkedParentData.uid) // Match the uid field in the 'parent' collection
              );
  
              const parentSnapshot = await getDocs(parentRef);
              parentSnapshot.forEach((parentDoc) => {
                if (parentDoc.exists()) {
                  const parentData = parentDoc.data();
  
                  // If the parent data is found and not already added, add it to the linkedParents array
                  if (!parentIds.has(parentDoc.id)) {
                    parentIds.add(parentDoc.id);
                    linkedParents.push({
                      id: parentDoc.id,
                      username: parentData.username || 'Unknown Parent', // Handle missing name
                      ...parentData,
                    });
                  }
                }
              });
            }
          }
  
          // Set the filtered linked parents (users) after all async calls are done
          setChatUsers(linkedParents);
          setLoading(false); // Set loading to false after data is fetched
        } else {
          console.log("Logged-in student not found.");
          setLoading(false); // Set loading to false if no student found
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
  
    // Call the fetchUsers function
    fetchUsers();
  }, []); // Empty dependency array to only run once when the component mounts

  // Real-time listener for messages
  useEffect(() => {
    const unsubscribeMessages = chatUsers.map((user) => {
      const currentUser = getAuth().currentUser;
      const currentUserId = currentUser?.uid;

      if (!currentUserId || !user.id) return;

      const chatId = currentUserId < user.id ? `${currentUserId}_${user.id}` : `${user.id}_${currentUserId}`;
      const messagesRef = collection(db, 'Chats', chatId, 'Messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      return onSnapshot(q, (querySnapshot) => {
        const newMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages((prevMessages) => ({
          ...prevMessages,
          [chatId]: newMessages, // Store messages for each user by chatId
        }));
      });
    });

    // Cleanup on component unmount
    return () => {
      unsubscribeMessages.forEach((unsubscribe) => unsubscribe());
    };
  }, [chatUsers]);

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

  const navigateToPage = (page) => {
    navigation.navigate(page); // Correct navigation function
  };

  return (
    <>
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
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>Messages</Text>
        </View>

        {/* Chat Users Display */}
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <View style={styles.parentListContainer}>
            {chatUsers.length > 0 ? (
              chatUsers.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate('ChatPage', { user: user })}
                >
                  <View style={styles.parentItem}>
                    <Text style={styles.parentName}>{user.username}</Text>
                    {/* Display the latest message for each chat */}
                    <Text style={styles.latestMessage}>
  {messages[`${user.id}_${getAuth().currentUser.uid}`] &&
    messages[`${user.id}_${getAuth().currentUser.uid}`].slice(-1)[0]?.text}
</Text>

                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noParentsText}>No users found.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal for sliding menu */}
      <Modal
        visible={menuVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeMenu}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.overlay} onPress={closeMenu} />
          <Animated.View style={[styles.slideMenu, { transform: [{ translateX: slideAnim }] }]} >
            <View style={styles.menu}>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <Text style={styles.closeButtonText}> X </Text>
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
    backgroundColor: '#BCE5FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 34,
    resizeMode: 'contain',
    right: 100,
    elevation: 5,
  },
  gatesync: {
    width: 100,
    height: 34,
    resizeMode: 'contain',
    right: 100,
    elevation: 5,
  },
  menuIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  latestMessage: {
    fontSize: 14,
    color: '#555', // Soft gray for readability
    fontStyle: 'italic', // Make it italic to differentiate
    marginTop: 4,
    backgroundColor: '#E3F2FD', // Light blue background
    padding: 5,
    borderRadius: 5,
    overflow: 'hidden',
    maxWidth: '90%', // Prevents overflow
  },
  
  welcomeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#5394F2',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  parentItem: {
    backgroundColor: '#CFE5FF',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  parentName: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  parentListContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  noParentsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default MessageScreen;
