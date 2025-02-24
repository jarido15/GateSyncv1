import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList 
} from 'react-native';
import Toast from 'react-native-toast-message';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { getAuth } from 'firebase/auth';
import messaging from '@react-native-firebase/messaging';

const LinkedParent = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [linkedParents, setLinkedParents] = useState([]);

  const auth = getAuth();
  const studentUid = auth.currentUser ? auth.currentUser.uid : '';

  useEffect(() => {
    if (studentUid) {
      fetchLinkedParents();
    }
  }, [studentUid]);

  // 🏗 Fetch linked parents from Firestore
  const fetchLinkedParents = async () => {
    try {
      const studentQuery = query(collection(db, 'students'), where('uid', '==', studentUid));
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) return;

      const studentDoc = studentSnapshot.docs[0];
      const docUid = studentDoc.id;

      const linkedParentSnapshot = await getDocs(collection(db, 'students', docUid, 'LinkedParent'));
      const linkedParentList = linkedParentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLinkedParents(linkedParentList);
    } catch (error) {
      console.error('❌ Error fetching linked parents:', error);
    }
  };

  // 🔍 Search Parent in Firestore
  const searchParent = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const parentRef = collection(db, 'parent');
      const q = query(parentRef, where('username', '==', searchQuery));
      const querySnapshot = await getDocs(q);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      setSearchResults(results);

      if (results.length === 0) {
        Toast.show({ type: 'info', text1: 'No Parent Found' });
      }
    } catch (error) {
      console.error('❌ Error searching:', error);
      Toast.show({ type: 'error', text1: 'Error searching parent' });
    }
  };

  const toggleParentLink = async (parent) => {
    if (!auth.currentUser) {
      Toast.show({ type: 'error', text1: 'No Student Found' });
      return;
    }
  
    try {
      const studentQuery = query(collection(db, 'students'), where('uid', '==', auth.currentUser.uid));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        Toast.show({ type: 'error', text1: 'Student not found in Firestore' });
        return;
      }
  
      const studentDoc = studentSnapshot.docs[0];
      const docUid = studentDoc.id;
      const studentData = studentDoc.data();
  
      const linkedStudentRef = doc(db, 'parent', parent.id, 'LinkedStudent', docUid);
      const linkedParentRef = doc(db, 'students', docUid, 'LinkedParent', parent.id);
  
      const linkedParentSnapshot = await getDocs(collection(db, 'students', docUid, 'LinkedParent'));
      const alreadyLinked = linkedParentSnapshot.docs.some((doc) => doc.id === parent.id);
  
      if (alreadyLinked) {
        await deleteDoc(linkedParentRef);
        await deleteDoc(linkedStudentRef);
  
        setLinkedParents((prev) => prev.filter((p) => p.id !== parent.id));
        Toast.show({ type: 'info', text1: 'Parent Unlinked' });
  
        // Add notification for unlinking the parent
        await addNotification('Unlinked', studentData, parent);
      } else {
        // Set the status to "Pending" when linking
        const linkedParentData = {
          username: parent.username,
          email: parent.email,
          contactNumber: parent.contactNumber || 'N/A',
          uid: parent.id,
          status: 'Pending', // Set the status to "Pending"
        };
  
        const linkedStudentData = {
          username: studentData.username,
          course: studentData.course,
          idNumber: studentData.idNumber,
          yearLevel: studentData.yearLevel,
          uid: studentData.uid,
          status: 'Pending', // Set the status to "Pending"
        };
  
        // Link parent and student with "Pending" status
        await setDoc(linkedParentRef, linkedParentData);
        await setDoc(linkedStudentRef, linkedStudentData);
  
        // Update action field to 'active' once linked
        await setDoc(linkedStudentRef, { action: 'active' }, { merge: true });

        setLinkedParents((prev) => [...prev, parent]);
        Toast.show({ type: 'success', text1: 'Parent Linked Successfully (Pending)' });
  
        // Send Push Notification to Parent
        sendPushNotification(parent);
  
        // Add notification for linking the parent
        await addNotification('Linked', studentData, parent);
      }
    } catch (error) {
      console.error('❌ Error updating linked parent:', error);
      Toast.show({ type: 'error', text1: 'Error linking parent' });
    }
};

  // Add a function to save the notification in Firestore
  const addNotification = async (action, studentData, parent) => {
    try {
      const notificationData = {
        action,
        idNumber: studentData.idNumber,
        studentName: studentData.username,
        uid: parent.uid,
        parentName: parent.username,
        timestamp: new Date(),
        status: action === 'Linked' ? 'Pending' : 'Unlinked',
      };
  
      // Save the notification in Firestore under 'notifications' collection
      await setDoc(doc(db, 'notifications', `${studentData.uid}_${parent.id}_${Date.now()}`), notificationData);
  
      console.log('Notification saved:', notificationData);
    } catch (error) {
      console.error('❌ Error adding notification:', error);
      Toast.show({ type: 'error', text1: 'Error adding notification' });
    }
  };
  
  // Send Push Notification
  const sendPushNotification = async (parent) => {
    try {
      // Fetch the parent's device token (assuming it's stored in Firestore)
      const parentDoc = await getDoc(doc(db, 'parent', parent.id));
      const parentData = parentDoc.data();
      const deviceToken = parentData.deviceToken; // Store the token when the parent registers for push notifications

      // Send a notification using Firebase Cloud Messaging
      if (deviceToken) {
        await messaging().sendToDevice(deviceToken, {
          notification: {
            title: 'Parent Link Notification',
            body: `Your link request with ${auth.currentUser.displayName} is now Pending.`,
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
        });
        Toast.show({ type: 'success', text1: 'Push Notification Sent' });
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      Toast.show({ type: 'error', text1: 'Failed to send notification' });
    }
  };

  return (
    <>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.navbar}>
              <TouchableOpacity onPress={() => navigation.navigate('StudentPage')}>
                <Image source={require('../images/back.png')} style={styles.back} />
              </TouchableOpacity>
              <View style={styles.navCenter}>
                <Image source={require('../images/logo.png')} style={styles.logo} />
                <Image source={require('../images/GateSync.png')} style={styles.gatesync} />
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Image source={require('../images/search.png')} style={styles.searchicon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Parent Username"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchParent}
                autoCapitalize="none"
              />
            </View>
          </>
        }
        renderItem={({ item }) => {
          const isLinked = linkedParents.some(p => p.id === item.id);
          return (
            <View style={styles.messagecontainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ChatPage', { user: item })}
                style={styles.resultCard}
              >
                <View style={styles.profileWrapper}>
                  <Image source={require('../images/account_circle.png')} style={styles.chatIcon} />
                </View>
        
                <View style={styles.resultTextContainer}>
                  <Text style={styles.chatname}>{item.username}</Text>
                </View>
        
                {/* 🔗 Toggle Link Button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent navigating when clicking the button
                    toggleParentLink(item);
                  }}
                  style={styles.addButton}
                >
                  <Image
                    source={
                      isLinked
                        ? require('../images/checked.png')
                        : require('../images/add.png')
                    }
                    style={styles.addicon}
                  />
                </TouchableOpacity>
        
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={() => <Text style={styles.noResults}>No results found</Text>}
      />
        
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#BCE5FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
  },
  navCenter: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 35, height: 34, resizeMode: 'contain', marginRight: 10, left: '-60%' },
  gatesync: { width: 100, height: 34, top: 5, resizeMode: 'contain', left: '-60%' },
  back: { width: 30, height: 30, resizeMode: 'contain' },
  searchContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#6B9BFA',
    height: 60,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  searchInput: {
    width: '90%',
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6B9BFA',
    paddingLeft: 10,
    backgroundColor: '#fff',
    top: '-37%',
    right: -20,
  },
  searchicon: { width: 30, height: 30, right: 150, top: '25%' },
  messagecontainer: {
    backgroundColor: '#CFE5FF',
    width: '90%',
    borderRadius: 15,
    alignSelf: 'center',
    marginVertical: 10,
    padding: 15,
    flexDirection: 'row',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  chatIcon: { width: 50, height: 50, borderRadius: 25 },
  addicon: { width: 25, height: 25 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  profileWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  resultTextContainer: { flex: 1 },
  resultName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B9BFA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#999' },
});

export default LinkedParent;
