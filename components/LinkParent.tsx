import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList 
} from 'react-native';
import Toast from 'react-native-toast-message';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase'; // Ensure Firebase is configured
import { getAuth } from 'firebase/auth'; // Import Firebase Auth

const LinkedParent = ({ navigation }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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
        Toast.show({
          type: 'info',
          text1: 'No Parent Found',
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      Toast.show({
        type: 'error',
        text1: 'Error searching parent',
      });
    }
  };

  // ✅ Toggle Parent Linking and Update Firestore (Add Parent to Student)
// ✅ Toggle Parent Linking and Update Firestore (Add Parent to Student)
const toggleIcon = async (parentUid) => {
  setIsAdded(!isAdded);

  try {
    // Log the parent UID and student UID for debugging
    const studentUid = auth.currentUser ? auth.currentUser.uid : '';
    console.log('Parent UID:', parentUid);
    console.log('Student UID:', studentUid);

    // Query students collection to find the student by UID field
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('uid', '==', studentUid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`Student with UID ${studentUid} does not exist`);
    }

    // Get the student document
    const studentDoc = querySnapshot.docs[0]; // Assumes there is only one match
    const studentDocRef = studentDoc.ref;

    // Check if the parent document exists using the parent UID
    const parentDocRef = doc(db, 'parent', parentUid);
    const parentDocSnap = await getDoc(parentDocRef);

    if (!parentDocSnap.exists()) {
      throw new Error(`Parent with UID ${parentUid} does not exist`);
    }

    // Add the parent's UID to the student document
    await updateDoc(studentDocRef, {
      parentUid: parentUid, // Add the parent UID to the student's record
    });

    // Provide feedback to the user
    Toast.show({
      type: 'success',
      text1: isAdded ? 'Parent Unlinked' : 'Parent Linked Successfully',
    });
  } catch (error) {
    console.error('Error updating student with parent:', error);
    Toast.show({
      type: 'error',
      text1: error.message || 'Error linking parent to student',
    });
  }
};



  // Get logged-in student's UID from Firebase Auth
  const auth = getAuth();
  const idNumber = auth.currentUser ? auth.currentUser.uid : ''; // Get student ID number (uid)

  return (
    <>
      {/* 🏁 Wrap entire UI in FlatList */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled" // Allows clicking items while keyboard is open
        ListHeaderComponent={
          <>
            {/* 🔹 Navigation Bar */}
            <View style={styles.navbar}>
              <TouchableOpacity onPress={() => navigation.navigate('StudentPage')}>
                <Image source={require('../images/back.png')} style={styles.back} />
              </TouchableOpacity>
              <View style={styles.navCenter}>
                <Image source={require('../images/logo.png')} style={styles.logo} />
                <Image source={require('../images/GateSync.png')} style={styles.gatesync} />
              </View>
            </View>

            {/* 🔍 Search Bar */}
            <View style={styles.searchContainer}>
              <Image source={require('../images/search.png')} style={styles.searchicon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Parent Username"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchParent} // Search when user presses enter
                autoCapitalize="none"
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.messagecontainer}>
            <TouchableOpacity onPress={() => navigation.navigate('ChatPage')}>
              <View style={styles.chatbar} />
              <Text style={styles.chatname}>{item.username}</Text>
              <View style={styles.chatcircle}>
                <Image source={require('../images/account_circle.png')} style={styles.chatIcon} />
                <TouchableOpacity onPress={() => toggleIcon(item.id, idNumber)}>
                  <Image
                    source={isAdded ? require('../images/checked.png') : require('../images/add.png')}
                    style={styles.addicon}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noResults}>No results found</Text>
        )}
      />

      {/* Toast Component */}
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
    height: 206,
    borderRadius: 21,
    alignSelf: 'center',
    top: '5%',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  chatIcon: { width: 104, height: 104, top: -15, right: 15 },
  addicon: { width: 34, height: 33, top: -45, right: 10 },
  chatcircle: { backgroundColor: '#fff', width: 81, height: 75, borderRadius: 50, top: -45, right: -30 },
  chatname: { fontSize: 20, color: '#fff', fontWeight: '800', alignSelf: 'center', top: 5 },
  chatbar: {
    backgroundColor: '#6b9bfa',
    width: '80%',
    height: 48,
    borderRadius: 21,
    elevation: 5,
    alignSelf: 'center',
    top: '28%',
  },
  noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#999' },
});

export default LinkedParent;
