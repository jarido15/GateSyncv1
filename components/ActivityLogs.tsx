import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { onSnapshot, query, collection, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import your Firebase config

const MessageScreen = ({ navigation }) => {
  const [hasActivities, setHasActivities] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Get the logged-in student's uid from the 'students' collection
          const studentsRef = collection(db, 'students');  // Reference to the 'students' collection
          const q = query(studentsRef, where('uid', '==', user.uid));  // Query to find the student by uid
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];  // Get the first document from the query
            const studentData = studentDoc.data();
            const userIdNumber = studentData?.idNumber; // Assuming 'idNumber' exists in the student document
            console.log('Logged-in student ID:', userIdNumber); // Log the student idNumber

            if (!userIdNumber) {
              console.log('User does not have a valid idNumber.');
              return;  // If no idNumber, exit the function
            }

            // Query the scanned_ids collection for documents with matching idNumber
            const scannedIdsRef = collection(db, 'scanned_ids');
            const q = query(scannedIdsRef, where('idNumber', '==', userIdNumber));

            // Listen for real-time updates
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              if (!querySnapshot.empty) {
                const fetchedActivities = querySnapshot.docs.map(doc => {
                  const data = doc.data();
                  console.log('Fetched activity doc data:', data);  // Log the document data

                  // Check if timestamp is a valid string and format it correctly
                  const timestamp = data.timestamp;
                  let formattedTimestamp = 'Invalid timestamp';
                  
                  // Check if the timestamp string matches the expected format
                  if (timestamp && !isNaN(Date.parse(timestamp))) {
                    const date = new Date(timestamp);
                    formattedTimestamp = date.toLocaleString();  // Format the date
                  }

                  return {
                    description: data.description,
                    timestamp: formattedTimestamp,  // Safely format the timestamp
                    status: data.status,
                  };
                });
                console.log('Fetched activities:', fetchedActivities);  // Log the fetched activities
                setActivities(fetchedActivities);  // Store fetched activities
                setHasActivities(true);  // Set the flag that activities exist
              } else {
                console.log('No activities found for this user.');  // Log if no activities were found
                setActivities([]); // Clear the activities list
                setHasActivities(false);  // No activities found
              }
            });

            // Clean up the listener when the component is unmounted
            return () => unsubscribe();
          } else {
            console.log('No student data found for the logged-in user.');
          }
        } else {
          console.log('No user is logged in.');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchActivities();  // Call the function when component mounts
  }, []);  // Empty dependency array means this runs only once when the component mounts

  return (
    <>
      {/* Main ScrollView */}
      <ScrollView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.navigate('StudentPage')}>
            <Image
              source={require('../images/back.png')} // Replace with your burger menu image path
              style={styles.back}
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
          <Text style={styles.welcomeText}>Activity Logs</Text>

          {/* Conditionally render the "No activities" container */}
          {!hasActivities ? (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.noActivitiesText}>No activities</Text>
            </View>
          ) : (
            // Render activities here if hasActivities is true
            activities.map((activity, index) => (
              <View key={index} style={styles.activityContainer}>
                <Text style={styles.timestampText}>Scan Time: {activity.timestamp}</Text>
                <Text style={styles.statusText}>Status: {activity.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  welcomeText: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'Kanit',
    color: '#5394F2',
    top: '10%',
  },
  noActivitiesContainer: {
    backgroundColor: '#FFCCCB',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  noActivitiesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF4C4C',
  },
  timestampText: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  activityContainer: {
    marginTop: 30,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#BCE5FF',
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
  },
});

export default MessageScreen;
