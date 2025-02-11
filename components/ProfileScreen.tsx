import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [course, setCourse] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0]; // Get the first matching document
          const userData = studentDoc.data();

          setUserName(userData.username || '');
          setCourse(userData.course || '');
          setIdNumber(userData.idNumber || '');
          setYearLevel(userData.yearLevel || '');
          setEmail(userData.email || '');
        } else {
          Alert.alert('Error', 'User not found in students collection');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      }
    }
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDocRef = querySnapshot.docs[0].ref; // Get the document reference
          await updateDoc(studentDocRef, {
            username: userName,
            course: course,
            idNumber: idNumber,
            yearLevel: yearLevel,
            email: email,
          });

          Alert.alert('Success', 'Profile updated successfully');
          setModalVisible(false);
        } else {
          Alert.alert('Error', 'User not found in students collection');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };

  return (
    <LinearGradient colors={['#BCE5FF', '#FFFFFF']} style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../images/back.png')} style={styles.back} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Image source={require('../images/logo.png')} style={styles.logo} />
          <Image source={require('../images/GateSync.png')} style={styles.gatesync} />
        </View>
      </View>

      {/* Profile Details Container */}
      <LinearGradient colors={['#BCE5FF', '#FFFFFF']} style={styles.profileContainer}>
        <Image source={require('../images/account_circle.png')} style={styles.profileicon} />
        <Text style={styles.infolabel}>NAME:</Text>
        <Text style={styles.username}>{userName}</Text>

        <Text style={styles.infolabel}>COURSE:</Text>
        <Text style={styles.course}>{course}</Text>

        <Text style={styles.infolabel}>ID NUMBER:</Text>
        <Text style={styles.infoid}>{idNumber}</Text>

        <Text style={styles.infolabel}>YEAR LEVEL:</Text>
        <Text style={styles.infolevel}>{yearLevel}</Text>

        <Text style={styles.infolabel}>EMAIL:</Text>
        <Text style={styles.infomail}>{email}</Text>

        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Edit Profile Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput style={styles.input} placeholder="User Name" value={userName} onChangeText={setUserName} />
            <TextInput style={styles.input} placeholder="Course" value={course} onChangeText={setCourse} />
            <TextInput style={styles.input} placeholder="ID Number" value={idNumber} onChangeText={setIdNumber} />
            <TextInput style={styles.input} placeholder="Year Level" value={yearLevel} onChangeText={setYearLevel} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    left: '-60%',
  },
  gatesync: {
    width: 100,
    height: 34,
    top: 5,
    resizeMode: 'contain',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    left: '-60%',
  },
  back: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  profileicon: {
    width: 144,
    height: 137,
    alignSelf: 'center',
  },
  usernamne: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'black',
  },
  course: {
    right: 25,
    top: '-4.5%',
    fontSize: 16,
    alignSelf: 'center',
    fontWeight: '800',
  },
  infolabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginTop: 20,
    left: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 140,
    top: '-4.5%',
  },
  infoid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 140,
    top: '-4.5%',
  },
  infolevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 140,
    top: '-4.5%',
  },
  infomail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 140,
    top: '-4.5%',
  },
  editButton: {
    backgroundColor: '#6B9BFA',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    top: '1%',
  },
  editButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Profile container with gradient and shadow
  profileContainer: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    height: 540,
    width: '90%',
    alignSelf: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#D3D3D3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#6B9BFA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
