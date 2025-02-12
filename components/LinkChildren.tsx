import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput 
} from 'react-native';
import Toast from 'react-native-toast-message';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { getAuth } from 'firebase/auth';

const LinkChildren = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [linkedStudents, setLinkedStudents] = useState([]);

  const auth = getAuth();
  const parentUid = auth.currentUser ? auth.currentUser.uid : '';

  // 🔍 Search for a student in Firestore by username
  const searchStudent = async () => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      Toast.show({ type: 'info', text1: 'Enter a username to search' });
      return;
    }

    try {
      const studentRef = collection(db, 'students');
      const q = query(studentRef, where('username', '==', searchQuery));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        setSearchResult({ id: studentDoc.id, ...studentDoc.data() });
      } else {
        setSearchResult(null);
        Toast.show({ type: 'info', text1: 'No Student Found' });
      }
    } catch (error) {
      console.error('❌ Error searching:', error);
      Toast.show({ type: 'error', text1: 'Error searching student' });
    }
  };

  const toggleStudentLink = async (student) => {
    if (!auth.currentUser) {
      Toast.show({ type: 'error', text1: 'No Parent Found' });
      return;
    }
  
    try {
      const linkedStudentRef = doc(db, 'parent', parentUid, 'LinkedStudent', student.id);
      const linkedParentRef = doc(db, 'students', student.id, 'LinkedParent', parentUid);
  
      const linkedStudentsSnapshot = await getDocs(collection(db, 'parent', parentUid, 'LinkedStudent'));
      const alreadyLinked = linkedStudentsSnapshot.docs.some((doc) => doc.id === student.id);
  
      if (alreadyLinked) {
        // ❌ Unlink Student
        await deleteDoc(linkedStudentRef);
        await deleteDoc(linkedParentRef);
  
        setLinkedStudents((prev) => prev.filter((s) => s.id !== student.id));
        Toast.show({ type: 'info', text1: 'Student Unlinked' });
      } else {
        // ✅ Link Student
        await setDoc(linkedStudentRef, {
          username: student.username,
          idNumber: student.idNumber,
          course: student.course,
          yearLevel: student.yearLevel,
          studentUid: student.uid, // 🔹 Store student's UID
        });
  
        await setDoc(linkedParentRef, {
          username: auth.currentUser.displayName || 'Parent',
          email: auth.currentUser.email,
          contactNumber: 'N/A',
          uid: parentUid, 
        });
  
        setLinkedStudents((prev) => [...prev, student]);
        Toast.show({ type: 'success', text1: 'Student Linked Successfully' });
      }
    } catch (error) {
      console.error('❌ Error updating linked student:', error);
      Toast.show({ type: 'error', text1: 'Error linking student' });
    }
  };
  
  return (
    <>
      <ScrollView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.navigate('ParentPage')}>
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
            placeholder="Search Student Username"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchStudent} // Search on enter
            autoCapitalize="none"
          />
        </View>

        {/* 🏁 Display Search Results */}
        {searchResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultCard}>
              <View style={styles.profileWrapper}>
                <Image source={require('../images/account_circle.png')} style={styles.profileImage} />
              </View>

              <View style={styles.resultTextContainer}>
                <Text style={styles.resultName}>{searchResult.username}</Text>
                <Text style={styles.resultInfo}>ID: {searchResult.idNumber}</Text>
                <Text style={styles.resultInfo}>Course: {searchResult.course}</Text>
              </View>

              {/* 🔗 Toggle Link Button */}
              <TouchableOpacity onPress={() => toggleStudentLink(searchResult)} style={styles.addButton}>
                <Image
                  source={
                    linkedStudents.some((s) => s.id === searchResult.id) 
                      ? require('../images/checked.png') // ✅ Linked
                      : require('../images/add.png') // ➕ Not Linked
                  }
                  style={styles.addIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* No Results */}
        {!searchResult && searchQuery !== '' && <Text style={styles.noResults}>No results found</Text>}
      </ScrollView>

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
    elevation: 5,
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6B9BFA',
    paddingLeft: 15,
    backgroundColor: '#fff',
    marginLeft: 10,
  },
  searchicon: { width: 25, height: 25, marginLeft: 10 },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  profileWrapper: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
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
  addIcon: {
    width: 25,
    height: 25,
  },
  noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#999' },
});

export default LinkChildren;