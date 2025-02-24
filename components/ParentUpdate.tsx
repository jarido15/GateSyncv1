import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Animated, StatusBar } from 'react-native';
import { doc, deleteDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../components/firebase'; // Your Firebase Firestore setup
import { getAuth } from 'firebase/auth';
import LinearGradient from 'react-native-linear-gradient';

const ParentUpdate = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false); // State to control menu modal visibility
    const [notifications, setNotifications] = useState([]); // Array to hold notifications
    const [linkedStudents, setLinkedStudents] = useState([]); // Array to hold linked students
    const slideAnim = useRef(new Animated.Value(-400)).current; // Initial position of the modal (off-screen to the left)
    const auth = getAuth();
    const currentUserUID = auth.currentUser ? auth.currentUser.uid : null;

    useEffect(() => {
        if (currentUserUID) {
            const fetchLinkedStudents = async () => {
                try {
                    // Query the linked students for the current parent where action is 'active'
                    const q = query(
                        collection(db, 'parent', currentUserUID, 'LinkedStudent'),
                        where('action', '==', 'active')  // Only fetch students with action field set to 'active'
                    );
                    const linkedStudentsSnapshot = await getDocs(q);
    
                    const students = linkedStudentsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        username: doc.data().username, // Assuming 'username' field exists in the document
                        ...doc.data(),
                    }));
    
                    setLinkedStudents(students);  // Set the linked students that are active
                } catch (error) {
                    console.error('Error fetching linked students: ', error);
                }
            };
    
            fetchLinkedStudents();
        }
    }, [currentUserUID]);
    
    

 
     const openMenu = () => {
         setMenuVisible(true); // Show the menu modal
         Animated.timing(slideAnim, {
             toValue: 0, // Slide the menu into the screen from the left
             duration: 300,
             useNativeDriver: true,
         }).start();
     };
 
     const closeMenu = () => {
         Animated.timing(slideAnim, {
             toValue: -400, // Slide the menu back off-screen to the left
             duration: 300,
             useNativeDriver: true,
         }).start(() => setMenuVisible(false)); // Hide the modal after the animation
     };
 
     const navigateToPage = (page) => {
         setMenuVisible(false); // Close the menu
         navigation.navigate(page); // Navigate to the selected page
     };

    const handleAccept = async (studentId, studentUID) => {
        try {
            // Step 1: Find the student by matching the 'uid' field in the students collection
            const studentsRef = collection(db, 'students');
            const studentsQuery = query(studentsRef, where('uid', '==', studentUID)); // Match the student's UID with 'uid' in students collection
            const studentsSnapshot = await getDocs(studentsQuery);
    
            if (!studentsSnapshot.empty) {
                const studentDoc = studentsSnapshot.docs[0]; // Assuming there's only one matching document
                console.log('Student found:', studentDoc.id);
    
                // Step 2: Find the parent in the LinkedParent subcollection inside the student's document
                const linkedParentRef = collection(studentDoc.ref, 'LinkedParent');
                const linkedParentQuery = query(linkedParentRef, where('uid', '==', currentUserUID)); // Match the parent's UID
                const linkedParentSnapshot = await getDocs(linkedParentQuery);
    
                if (!linkedParentSnapshot.empty) {
                    console.log('Parent found in LinkedParent subcollection inside student document');
    
                    // If found, update the status in the LinkedParent subcollection inside the student's document
                    const parentDocRef = doc(db, 'students', studentDoc.id, 'LinkedParent', linkedParentSnapshot.docs[0].id);
                    await updateDoc(parentDocRef, {
                        status: 'accepted', // Update status in LinkedParent subcollection
                    });
                    console.log('Status updated in LinkedParent');
                } else {
                    console.error('Parent not found in LinkedParent subcollection inside student document');
                    // If the parent does not exist, create a new document in LinkedParent subcollection
                    const newLinkedParentDocRef = doc(collection(studentDoc.ref, 'LinkedParent'));
                    await setDoc(newLinkedParentDocRef, {
                        uid: currentUserUID,
                        status: 'accepted', // Set initial status for new LinkedParent
                    });
                    console.log('Created new parent document in LinkedParent with accepted status');
                }
    
                // Step 3: Now, update the status in the LinkedStudent subcollection of the parent document
                const linkedStudentRef = collection(db, 'parent', currentUserUID, 'LinkedStudent');
                const linkedStudentQuery = query(linkedStudentRef, where('uid', '==', studentUID)); // Match the student's UID in the parent's LinkedStudent subcollection
                const linkedStudentSnapshot = await getDocs(linkedStudentQuery);
    
                if (!linkedStudentSnapshot.empty) {
                    console.log('Student found in LinkedStudent subcollection inside parent document');
    
                    // Update the status in the LinkedStudent subcollection of the parent
                    const linkedStudentDocRef = doc(db, 'parent', currentUserUID, 'LinkedStudent', linkedStudentSnapshot.docs[0].id);
                    await updateDoc(linkedStudentDocRef, {
                        status: 'accepted', // Update status in LinkedStudent subcollection of parent
                    });
    
                    console.log('Status updated in LinkedStudent subcollection');
                    // Update the state to reflect changes in the parent component (LinkedStudent state)
                    setLinkedStudents(prevState =>
                        prevState.map(student =>
                            student.id === studentId ? { ...student, status: 'accepted' } : student
                        )
                    );
                } else {
                    console.error('Student not found in LinkedStudent subcollection inside parent document');
                }
            } else {
                console.error('Student not found in students collection');
            }
        } catch (error) {
            console.error('Error accepting student: ', error);
        }
    };
    
    
    const handleDelete = async (studentId) => {
        try {
            // Step 1: Delete the LinkedStudent entry inside the parent's collection
            const studentRef = doc(db, 'parent', currentUserUID, 'LinkedStudent', studentId);
            await deleteDoc(studentRef);
    
            // Step 2: Find and delete the corresponding LinkedParent entries inside the students collection
            const studentDocRef = doc(db, 'students', studentId);
            const studentDocSnap = await getDoc(studentDocRef);
    
            if (studentDocSnap.exists()) {
                const studentData = studentDocSnap.data();
                
                // Query the LinkedParent subcollection for this student
                const linkedParentRef = collection(db, 'students', studentId, 'LinkedParent');
                const linkedParentSnapshot = await getDocs(linkedParentRef);
    
                // If there are any documents in the LinkedParent subcollection, delete each one
                if (!linkedParentSnapshot.empty) {
                    linkedParentSnapshot.forEach(async (linkedParentDoc) => {
                        await deleteDoc(linkedParentDoc.ref); // Delete each LinkedParent document
                        console.log(`LinkedParent document deleted from students collection.`);
                    });
                }
            }
    
            // Step 3: Update state to remove the deleted student from the linked list
            setLinkedStudents(prevState =>
                prevState.filter(student => student.id !== studentId)
            );
    
        } catch (error) {
            console.error('Error deleting student: ', error);
        }
    };
    

    return (
        <>
            
                <StatusBar backgroundColor="#BCE5FF" barStyle="light-content" />
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
                <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <LinearGradient colors={['#6B9BFA', '#0056FF']} style={styles.notif} />
                    <Image source={require('../images/Updates.png')} style={styles.notificon} />
                    <Text style={styles.noitfText}>Notifications</Text>
                    <Text style={styles.noitfText}>List</Text>
                    {/* Conditionally render the No Notifications message or the notifications list */}
                    {notifications.length === 0 ? (
                        <Text style={styles.noNotificationText}> </Text>
                    ) : (
                        notifications.map((notif, index) => (
                            <Text key={index} style={styles.notificationText}>
                                {notif}
                            </Text>
                        ))
                    )}

                    <View style={styles.linkedStudentsContainer}>
                        <Text style={styles.sectionTitle}> </Text>
                        {linkedStudents.length === 0 ? (
                            <Text style={styles.noNotificationText}> </Text>
                        ) : (
                            linkedStudents.map(student => (
                                <View key={student.id} style={styles.linkedParentContainer}>
                                    <Text style={styles.linkedParentText}>{student.username}</Text>
                                    <Text style={styles.linkedParentText}>Course: {student.course}</Text>
                                    <Text style={styles.linkedParentText}>Status: {student.status}</Text>
                                    {student.status !== 'accepted' && (
                                        <View style={styles.studentButtons}>
                                            <TouchableOpacity
                                                onPress={() => handleAccept(student.id, student.uid)}
                                                style={styles.acceptButton}
                                            >
                                                <Text style={styles. acceptButtonText}>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(student.id)}
                                                style={styles.deleteButton}
                                            >
                                                <Text style={styles.  deleteButtonText}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

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
        backgroundColor: '#BCE5FF', // Background color for the navigation bar
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    navCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 35, // Adjust logo size
        height: 34, // Adjust logo size
        resizeMode: 'contain', // Keep the aspect ratio of the logo
        marginRight: 10, // Space between logo and text
        shadowColor: '#000', // Shadow color (iOS)
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
        left: '-67%',
    },
    gatesync: {
        width: 100, // Adjust logo size
        height: 34, // Adjust logo size
        top: 5,
        resizeMode: 'contain', // Keep the aspect ratio of the logo
        marginRight: 10, // Space between logo and text
        shadowColor: '#000', // Shadow color (iOS)
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
        left: '-67%',
    },
    menuIcon: {
        width: 30, // Adjust menu icon size
        height: 30, // Adjust menu icon size
        resizeMode: 'contain',
    },
    navbarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // Text color
    },
    profileIcon: {
        width: 30, // Adjust profile icon size
        height: 30, // Adjust profile icon size
        resizeMode: 'contain',
    },
    content: {
        marginTop: 20,
        padding: 20,
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: '800',
        fontFamily: 'Kanit',
        color: '#5394F2',
        top: -30,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
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
        width: '80%', // Adjust the width as needed
        backgroundColor: '#fff',
        height: '100%',
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Shadow for Android
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
    notif: {
        width: '100%',
        height: 130,
        borderRadius: 21,
        alignSelf: 'center',
        top: '-1%',
        shadowColor: 'black', // Shadow color (iOS)
        shadowOffset: { width: 4, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.3, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        elevation: 5, // Shadow for Android
    },
    notificon: {
        width: 150,
        height: 160,
        left: '53%',
        top: -170,
    },
    noitfText: {
        fontSize: 25,
        fontFamily: 'MartianMono-Regular',
        color: '#fff',
        fontWeight: '800',
        top: -255,
        left: '8%',
    },
    noNotificationText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        top: '-30%',
        alignSelf: 'center',
    },
    notificationText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginVertical: 5,
    },
    linkedParentContainer: {
        padding: 25,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        top: '-70%',
        marginTop: 15,
        height: 170,
    },
    linkedParentText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    acceptButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        width: '40%',
        height: 45,
        backgroundColor: '#0059Ff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        left: '5%',
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        width: '40%',
        height: 45,
        marginTop: 10,
        left: '55%',
        top: -54,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ParentUpdate;

