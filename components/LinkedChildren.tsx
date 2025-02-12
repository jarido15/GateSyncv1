import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../components/firebase"; // Import auth to get logged-in user

const LinkedChildren = ({ navigation }) => {
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentUid, setParentUid] = useState(null); // Store logged-in parent's UID

  useEffect(() => {
    const fetchLinkedStudents = async () => {
      setLoading(true);
      const user = auth.currentUser; // Get currently logged-in user

      if (!user) {
        console.log("❌ No user logged in.");
        setLoading(false);
        return;
      }

      setParentUid(user.uid); // Store parent UID

      try {
        console.log("📌 Fetching linked students for parent UID:", user.uid);

        // 🔥 Fetch linked students from the correct subcollection inside the logged-in parent's document
        const linkedStudentsRef = collection(db, `parent/${user.uid}/LinkedStudent`);
        const linkedStudentsSnapshot = await getDocs(linkedStudentsRef);

        const students = linkedStudentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ Retrieved Linked Students:", students);
        setLinkedStudents(students);
      } catch (error) {
        console.error("❌ Error fetching linked students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedStudents();
  }, []);

  const unlinkStudent = async (studentId) => {
    Alert.alert("Confirm Unlink", "Are you sure you want to unlink this student?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unlink",
        style: "destructive",
        onPress: async () => {
          try {
            if (!parentUid) {
              console.error("❌ No parent UID found.");
              return;
            }
  
            // 🔥 Delete from parent's `LinkedStudent` subcollection
            const linkedStudentRef = doc(db, `parent/${parentUid}/LinkedStudent/${studentId}`);
            await deleteDoc(linkedStudentRef);
  
            // 🔥 Delete from student's `LinkedParent` subcollection
            const linkedParentRef = doc(db, `students/${studentId}/LinkedParent/${parentUid}`);
            await deleteDoc(linkedParentRef);
  
            console.log("✅ Student successfully unlinked from both parent and student collections.");
            Toast.show({ type: "success", text1: "Student unlinked successfully" });
  
            // Update local state to reflect the change
            setLinkedStudents((prevStudents) => prevStudents.filter((student) => student.id !== studentId));
          } catch (error) {
            console.error("❌ Error unlinking student:", error);
            Toast.show({ type: "error", text1: "Failed to unlink student" });
          }
        },
      },
    ]);
  };
  

  return (
    <>
      <ScrollView style={styles.container}>
        {/* 🔹 Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require("../images/back.png")} style={styles.back} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Image source={require("../images/logo.png")} style={styles.logo} />
            <Image source={require("../images/GateSync.png")} style={styles.gatesync} />
          </View>
          <TouchableOpacity onPress={() => console.log("Profile pressed")}>
            <Image source={require("../images/account.png")} style={styles.profileIcon} />
          </TouchableOpacity>
        </View>

        {/* 🔹 Header */}
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Linked Students</Text>
        </View>

        {/* 🔄 Loading Indicator */}
        {loading ? (
          <ActivityIndicator size="large" color="#6B9BFA" style={styles.loader} />
        ) : (
          <>
            {/* 🏁 Display Linked Students */}
            {linkedStudents.length > 0 ? (
              linkedStudents.map((student) => (
                <View key={student.id} style={styles.studentCard}>
                  {/* Profile Picture */}
                  <View style={styles.profileWrapper}>
                    <Image source={require("../images/account_circle.png")} style={styles.profileImage} />
                  </View>

                  {/* Student Info */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.studentName}>{student.username}</Text>
                    <Text style={styles.studentInfo}>ID: {student.idNumber}</Text>
                    <Text style={styles.studentInfo}>Course: {student.course}</Text>
                  </View>

                  {/* Unlink Button */}
                  <TouchableOpacity onPress={() => unlinkStudent(student.id)} style={styles.removeButton}>
                    <Image source={require("../images/minus.png")} style={styles.removeIcon} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noResults}>No linked students found</Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Toast Notification */}
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#BCE5FF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
  },
  navCenter: { flexDirection: "row", alignItems: "center" },
  logo: { width: 35, height: 34, resizeMode: "contain", marginRight: 10 },
  gatesync: { width: 100, height: 34, resizeMode: "contain" },
  back: { width: 30, height: 30, resizeMode: "contain" },
  profileIcon: { width: 30, height: 30, resizeMode: "contain" },
  content: { marginTop: 20, padding: 20 },
  welcomeText: { fontSize: 28, fontWeight: "bold", color: "#5394F2", textAlign: "center" },
  loader: { marginTop: 50 },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    width: "90%",
    padding: 15,
    borderRadius: 15,
    alignSelf: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  profileWrapper: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  profileImage: { width: 50, height: 50 },
  infoContainer: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  studentInfo: { fontSize: 14, color: "#666", marginTop: 3 },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E195AB",
    alignItems: "center",
    justifyContent: "center",
  },
  removeIcon: { width: 25, height: 25 },
  noResults: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#999" },
});

export default LinkedChildren;
