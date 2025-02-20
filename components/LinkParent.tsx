import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList 
} from 'react-native';
import Toast from 'react-native-toast-message';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { getAuth } from 'firebase/auth';

const LinkedParent = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [linkedParents, setLinkedParents] = useState([]);

  const auth = getAuth();
  const studentUid = auth.currentUser ? auth.currentUser.uid : '';

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
      // 🔍 Find the student's document ID (`docUid`)
      const studentQuery = query(collection(db, 'students'), where('uid', '==', auth.currentUser.uid));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        Toast.show({ type: 'error', text1: 'Student not found in Firestore' });
        return;
      }
  
      // Get student's document ID (`docUid`)
      const studentDoc = studentSnapshot.docs[0];
      const docUid = studentDoc.id; 
      const studentData = studentDoc.data(); // Get student data
  
      // Parent's `LinkedStudent` reference
      const linkedStudentRef = doc(db, 'parent', parent.id, 'LinkedStudent', docUid);
      
      // Student's `LinkedParent` reference
      const linkedParentRef = doc(db, 'students', docUid, 'LinkedParent', parent.id);
  
      // Check if already linked
      const linkedParentSnapshot = await getDocs(collection(db, 'students', docUid, 'LinkedParent'));
      const alreadyLinked = linkedParentSnapshot.docs.some((doc) => doc.id === parent.id);
  
      if (alreadyLinked) {
        // ❌ Unlink Parent
        await deleteDoc(linkedParentRef); // Remove from student's `LinkedParent`
        await deleteDoc(linkedStudentRef); // Remove from parent's `LinkedStudent`
  
        setLinkedParents((prev) => prev.filter((p) => p.id !== parent.id));
        Toast.show({ type: 'info', text1: 'Parent Unlinked' });
      } else {
        // ✅ Link Parent
        await setDoc(linkedParentRef, {
          username: parent.username,
          email: parent.email,
          contactNumber: parent.contactNumber || 'N/A',
          uid: parent.id, 
        });
  
        // ✅ Link Student inside Parent's `LinkedStudent` (now storing studentUid)
        await setDoc(linkedStudentRef, {
          username: studentData.username,
          course: studentData.course,
          idNumber: studentData.idNumber,
          yearLevel: studentData.yearLevel,
          uid: studentData.uid, // 🔹 Store student's UID
        });
  
        setLinkedParents((prev) => [...prev, parent]);
        Toast.show({ type: 'success', text1: 'Parent Linked Successfully' });
      }
    } catch (error) {
      console.error('❌ Error updating linked parent:', error);
      Toast.show({ type: 'error', text1: 'Error linking parent' });
    }
  };


  return (
    <>
      {/* 🏁 FlatList for UI */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
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
              <TouchableOpacity onPress={() => navigation.navigate('ChatPage')}>
                <View style={styles.chatbar} />
                <Text style={styles.chatname}>{item.username}</Text>
                <View style={styles.chatcircle}>
                  <Image source={require('../images/account_circle.png')} style={styles.chatIcon} />
                  {isLinked ? (
                    <Image source={require('../images/checked.png')} style={styles.addicon} />
                  ) : (
                    <TouchableOpacity onPress={() => toggleParentLink(item)}>
                      <Image source={require('../images/add.png')} style={styles.addicon} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={() => <Text style={styles.noResults}>No results found</Text>}
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
