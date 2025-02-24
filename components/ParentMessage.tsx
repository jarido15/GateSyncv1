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
  const slideAnim = useRef(new Animated.Value(-400)).current;

  useEffect(() => {
    const fetchUsers = async () => {
      let linkedStudents = []; // Store unique linked students
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;
  
        const { uid } = currentUser; // Get the logged-in parent's UID
  
        // Query to find the logged-in parent
        const parentQuery = query(collection(db, 'parent'), where('uid', '==', uid));
        const parentSnapshot = await getDocs(parentQuery);
  
        if (parentSnapshot.empty) {
          console.warn('No parent found for the logged-in user.');
          return;
        }
  
        const studentUids = new Set(); // Use a set to avoid duplicate student UIDs
  
        for (const parentDoc of parentSnapshot.docs) {
          const parentId = parentDoc.id;
  
          // Query LinkedStudent subcollection for the logged-in parent and filter by status 'accepted'
          const linkedStudentRef = collection(db, 'parent', parentId, 'LinkedStudent');
          const linkedStudentQuery = query(linkedStudentRef, where('status', '==', 'accepted'));
          const linkedStudentSnapshot = await getDocs(linkedStudentQuery);
  
          for (const linkedDoc of linkedStudentSnapshot.docs) {
            if (linkedDoc.exists()) {
              const studentUid = linkedDoc.data()?.uid;
              if (studentUid) studentUids.add(studentUid);
            }
          }
        }
  
        // Only proceed with fetching students if there are student UIDs
        if (studentUids.size === 0) {
          console.log('No accepted students found.');
          setLoading(false); // Set loading to false as no students were found
          return;
        }
  
        // Fetch all students from the 'students' collection whose UID is in the LinkedStudent subcollection
        const studentQuery = query(collection(db, 'students'), where('uid', 'in', Array.from(studentUids)));
        const studentSnapshot = await getDocs(studentQuery);
  
        studentSnapshot.forEach((studentDoc) => {
          const studentData = studentDoc.data();
          linkedStudents.push({
            id: studentDoc.id,
            uid: studentData?.uid,
            username: studentData?.username || 'Unknown Student',
            ...studentData,
          });
        });
  
        setChatUsers(linkedStudents);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched or if an error occurs
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
               <TouchableOpacity onPress={() => navigateToPage('LinkedChildren')} style={styles.menuOption}>
                              <Text style={styles.menuOptionText}>Linked Children</Text>
                            </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateToPage('ParentProfile')} style={styles.menuOption}>
                               <Text style={styles.menuOptionText}>Profile</Text>
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
