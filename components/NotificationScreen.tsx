import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, updateDoc, deleteDoc } from 'firebase/firestore'; // Firestore methods
import { getAuth } from 'firebase/auth'; // Firebase Auth for logged-in user

const NotificationScreen = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false); // State to control menu modal visibility
    const [notifications, setNotifications] = useState([]); // Array to hold notifications
    const [linkedParentData, setLinkedParentData] = useState([]); // State to store LinkedParent data
    const slideAnim = useRef(new Animated.Value(-400)).current; // Initial position of the modal (off-screen to the left)

    const db = getFirestore(); // Get Firestore instance
    const auth = getAuth(); // Get Firebase Auth instance

    // Function to fetch LinkedParent data for the logged-in student
    const fetchLinkedParentData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                console.log("Logged-in user UID:", user.uid); // Log the logged-in user's UID
        
                // Query the students collection to find the document where the 'uid' field matches the logged-in user's UID
                const studentsRef = collection(db, 'students');
                const q = query(studentsRef, where('uid', '==', user.uid)); // Query to find the student document by UID
                const querySnapshot = await getDocs(q);
        
                if (!querySnapshot.empty) {
                    // Since the UID is inside the document, get the first matching document
                    const studentDoc = querySnapshot.docs[0];
                    console.log("Student document found:", studentDoc.data()); // Log the student document data
        
                    // Reference to the 'LinkedParent' subcollection within the student's document
                    const linkedParentCollectionRef = collection(studentDoc.ref, 'LinkedParent');
                    
                    // Query for LinkedParent where action is 'requesting'
                    const requestingQuery = query(linkedParentCollectionRef, where('action', '==', 'requesting'));
                    const linkedParentSnapshot = await getDocs(requestingQuery);
        
                    if (!linkedParentSnapshot.empty) {
                        const linkedParentArray = [];
                        linkedParentSnapshot.forEach((doc) => {
                            linkedParentArray.push(doc.data()); // Push each document's data into the array
                        });
                        setLinkedParentData(linkedParentArray); // Set the LinkedParent data in the state
                    } else {
                        console.log("No LinkedParent data with action 'requesting' found");
                    }
                } else {
                    console.log("No student document found for UID:", user.uid); // Log if no student document was found
                }
            } else {
                console.log("No user is logged in");
            }
        } catch (error) {
            console.error("Error fetching LinkedParent data:", error);
        }
    };
    
    
    // Function to accept LinkedParent and update the status
    const acceptLinkedParent = async (linkedParentId) => {
        if (!linkedParentId) {
            console.error("LinkedParent ID is not valid:", linkedParentId);
            return; // Exit the function early if the ID is invalid
        }
    
        try {
            const user = auth.currentUser;
            if (user) {
                // Fetch the student's document based on UID
                const studentsRef = collection(db, 'students');
                const q = query(studentsRef, where('uid', '==', user.uid));
                const querySnapshot = await getDocs(q);
    
                if (!querySnapshot.empty) {
                    const studentDoc = querySnapshot.docs[0]; // Student document
                    const linkedParentRef = doc(studentDoc.ref, 'LinkedParent', linkedParentId); // Reference to the specific LinkedParent document
    
                    // Update the LinkedParent status
                    await updateDoc(linkedParentRef, { status: 'accepted' });
    
                    console.log(`LinkedParent status updated to 'Accepted' for ${linkedParentId}`);
    
                    // Update the corresponding LinkedStudent document (if any)
                    const parentsRef = collection(db, 'parent');
                    const parentQuery = query(parentsRef, where('uid', '==', linkedParentId));
                    const parentQuerySnapshot = await getDocs(parentQuery);
    
                    if (!parentQuerySnapshot.empty) {
                        const parentDoc = parentQuerySnapshot.docs[0]; // Parent document
                        const linkedStudentRef = collection(parentDoc.ref, 'LinkedStudent');
                        const linkedStudentSnapshot = await getDocs(linkedStudentRef);
    
                        const linkedStudentDoc = linkedStudentSnapshot.docs.find(
                            doc => doc.data().uid === user.uid
                        );
    
                        if (linkedStudentDoc) {
                            await updateDoc(linkedStudentDoc.ref, { status: 'accepted' });
                            console.log(`LinkedStudent status updated to 'Accepted' for UID: ${user.uid}`);
                        } else {
                            console.log('LinkedStudent document not found');
                        }
                    } else {
                        console.log('Parent document not found');
                    }
                } else {
                    console.log('Student document not found');
                }
            } else {
                console.log('No user is logged in');
            }
        } catch (error) {
            console.error('Error accepting LinkedParent:', error);
        }
    };
    
    useEffect(() => {
        fetchLinkedParentData(); // Fetch LinkedParent data when component mounts
    }, []);

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

     // Function to delete LinkedParent data
     const deleteLinkedParent = async (linkedParentId) => {
        if (!linkedParentId) {
            console.error("LinkedParent ID is not valid:", linkedParentId);
            return; // Exit the function early if the ID is invalid
        }
    
        try {
            const user = auth.currentUser;
            if (user) {
                // Fetch the student's document based on UID
                const studentsRef = collection(db, 'students');
                const q = query(studentsRef, where('uid', '==', user.uid));
                const querySnapshot = await getDocs(q);
    
                if (!querySnapshot.empty) {
                    const studentDoc = querySnapshot.docs[0]; // Student document
                    
                    // Reference to the specific LinkedParent document
                    const linkedParentRef = doc(studentDoc.ref, 'LinkedParent', linkedParentId); 
                    
                    // Delete the LinkedParent document
                    await deleteDoc(linkedParentRef);
                    console.log(`LinkedParent document with ID ${linkedParentId} deleted.`);
    
                    // Reference to the parent collection and the LinkedStudent subcollection
                    const parentRef = doc(db, 'parent', linkedParentId);
                    const linkedStudentsRef = collection(parentRef, 'LinkedStudent');
                    
                    // Query LinkedStudent collection for matching document by UID
                    const linkedStudentsSnapshot = await getDocs(query(linkedStudentsRef, where('uid', '==', user.uid)));
                    if (!linkedStudentsSnapshot.empty) {
                        const linkedStudentDoc = linkedStudentsSnapshot.docs[0]; // LinkedStudent document to delete
                        await deleteDoc(linkedStudentDoc.ref); // Delete the document in LinkedStudent subcollection
                        console.log(`LinkedStudent document with UID ${user.uid} deleted from parent's LinkedStudent subcollection.`);
                    }
    
                    // Re-fetch the updated LinkedParent data after deletion
                    fetchLinkedParentData();
                } else {
                    console.log('Student document not found');
                }
            } else {
                console.log('No user is logged in');
            }
        } catch (error) {
            console.error('Error deleting LinkedParent:', error);
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
                        <Text style={styles.noNotificationText}>Notifications</Text>
                    ) : (
                        notifications.map((notif, index) => (
                            <Text key={index} style={styles.notificationText}>
                                {notif}
                            </Text>
                        ))
                    )}

                    {/* Render LinkedParent data if available */}
                    {linkedParentData.length > 0 ? (
                        linkedParentData.map((parent, index) => (
                            <View key={index} style={styles.linkedParentContainer}>
                                <Text style={styles.linkedParentText}>Parent Name: {parent.username}</Text>
                                <Text style={styles.linkedParentText}>Phone: {parent.contactNumber}</Text>
                                <Text style={styles.linkedParentText}>Email: {parent.email}</Text>

                                {/* Button to accept the linked parent */}
                                <TouchableOpacity
    style={styles.acceptButton}
    onPress={() => acceptLinkedParent(parent.uid)} // Ensure 'parent.id' is valid
>
    <Text style={styles.acceptButtonText}>Accept</Text>
</TouchableOpacity>

{/* Button to delete the linked parent */}
<TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteLinkedParent(parent.uid)} // Ensure 'parent.id' is valid
                                >
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>

                            </View>
                        ))
                    ) : (
                        <Text style={styles.noNotificationText}>No Parent Request</Text>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={menuVisible}
                animationType="none"
                transparent={true}
                onRequestClose={closeMenu}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.overlay} onPress={closeMenu} />

                    <Animated.View style={[styles.slideMenu, { transform: [{ translateX: slideAnim }] }]}>
                        <View style={styles.menu}>
                            <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity onPress={() => navigateToPage('Profile')} style={styles.menuOption}>
                                <Text style={styles.menuOptionText}>Profile</Text>
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
        top: '-30%',
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

export default NotificationScreen;
