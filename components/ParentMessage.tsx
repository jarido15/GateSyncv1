import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Animated, StatusBar, TextInput } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../components/firebase'; // Firebase config
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';

const MessageScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatUsers, setChatUsers] = useState([]); // Store users who are linked to the logged-in parent
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({}); // Store messages for each user
  const [newMessage, setNewMessage] = useState(''); // Store new message input
  const slideAnim = useRef(new Animated.Value(-400)).current;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const { uid } = currentUser; // Get the logged-in user's UID

        // Fetch the parents for the logged-in user (i.e., get the student's linked parent)
        const parentsRef = collection(db, 'parent');
        const parentsSnapshot = await getDocs(parentsRef);

        let linkedStudents = []; // Initialize the array to hold linked students

        // Loop through each parent and check for linked students
        for (const parentDoc of parentsSnapshot.docs) {
          const parentId = parentDoc.id;

          // Query LinkedStudent subcollection for the parent document
          const linkedStudentRef = query(
            collection(db, 'parent', parentId, 'LinkedStudent')
          );

          const linkedStudentSnapshot = await getDocs(linkedStudentRef);

          // Fetch student data for each LinkedStudent document
          const linkedPromises = linkedStudentSnapshot.docs.map(async (linkedDoc) => {
            if (linkedDoc.exists()) {
              const studentUid = linkedDoc.data()?.uid; // Use optional chaining here
              if (!studentUid) {
                console.error("Student UID is missing.");
                return null; // Skip if UID is missing
              }

              // Now query the 'students' collection to find a student whose UID matches the LinkedStudent's UID
              const studentQuery = query(collection(db, 'students'), where('uid', '==', studentUid));
              const studentSnapshot = await getDocs(studentQuery);

              // If student data exists
              if (!studentSnapshot.empty) {
                const studentDoc = studentSnapshot.docs[0];
                const studentData = studentDoc.data();
                return {
                  id: studentDoc.id, // Keep the document ID for possible later use
                  uid: studentData?.uid, // Use the uid for chatId generation
                  username: studentData?.username || 'Unknown Student', // Default value if username is missing
                  ...studentData,
                };
              } else {
                console.error(`No student found for UID: ${studentUid}`);
                return null; // Skip if no student document found
              }
            }
            return null; // Skip if LinkedStudent document doesn't exist
          });

          // Wait for all linked student data to be fetched
          const students = await Promise.all(linkedPromises);
          linkedStudents = [...linkedStudents, ...students.filter(Boolean)]; // Filter out any nulls
        }

        setChatUsers(linkedStudents); // Set the chatUsers state
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Listen for new messages for each chat user
  useEffect(() => {
    const unsubscribeMessages = chatUsers.map((user) => {
      const currentUser = getAuth().currentUser;
      const currentUserId = currentUser?.uid;

      if (!currentUserId || !user.uid) return;

      const chatId = [currentUserId, user.uid].sort().join('_');
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

  // Send message function
  // const sendMessage = async (user) => {
  //   if (newMessage.trim() === '') return;

  //   const currentUser = getAuth().currentUser;
  //   const currentUserId = currentUser?.uid;
  //   if (!currentUserId || !user?.uid) return;

  //   // Generate chatId using UID instead of document ID
  //   const chatId = [currentUserId, user.uid].sort().join('_');
  //   const messagesRef = collection(db, 'Chats', chatId, 'Messages');

  //   // Send the message with senderId and receiverId
  //   await addDoc(messagesRef, {
  //     text: newMessage,
  //     senderId: currentUserId,
  //     receiverId: user.uid,  // Ensure this is correctly set from LinkedStudent
  //     timestamp: serverTimestamp(),
  //   });

  //   setNewMessage(''); // Clear input field after sending
  // };
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
                  onPress={() => navigation.navigate('ParentChatPage', { user: user })}
                >
                  <View style={styles.parentItem}>
                    <Text style={styles.parentName}>{user.username}</Text>
                    {/* Display the latest message for each chat */}
                    <Text style={styles.latestMessage}>
                      {messages[`${user.id}_${getAuth().currentUser.uid}`] &&
                        messages[`${user.id}_${getAuth().currentUser.uid}`][0]?.text}
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
