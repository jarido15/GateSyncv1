import React, { useState, useEffect } from "react";
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
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../components/firebase";
import { getAuth } from "firebase/auth";

const LinkedParent = ({ navigation }) => {
  const [linkedParents, setLinkedParents] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const studentUid = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchLinkedParents = async () => {
      if (!studentUid) {
        console.log("❌ No student UID found.");
        setLoading(false);
        return;
      }

      try {
        console.log("📌 Searching for student document with UID:", studentUid);
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("uid", "==", studentUid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("❌ No student document found.");
          setLoading(false);
          return;
        }

        const studentDoc = querySnapshot.docs[0];
        const studentDocId = studentDoc.id; // Get the student document ID

        console.log("✅ Student Document ID:", studentDocId);

        // 🔥 Fetch all linked parents with 'accepted' status inside the LinkedParent subcollection
        const linkedParentRef = collection(db, "students", studentDocId, "LinkedParent");
        const qLinkedParents = query(linkedParentRef, where("status", "==", "accepted"));
        const linkedParentSnapshot = await getDocs(qLinkedParents);

        const parents = linkedParentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ Linked Parents Data:", parents);
        setLinkedParents(parents);
      } catch (error) {
        console.error("❌ Error fetching linked parents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedParents();
  }, [studentUid]);

  const unlinkParent = async (parentId) => {
    Alert.alert("Confirm Unlink", "Are you sure you want to unlink this parent?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unlink",
        style: "destructive",
        onPress: async () => {
          try {
            if (!studentUid) {
              console.error("❌ No student UID found.");
              return;
            }
  
            // 🔍 Query Firestore to find the student's document ID
            const studentsRef = collection(db, "students");
            const q = query(studentsRef, where("uid", "==", studentUid));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              const studentDoc = querySnapshot.docs[0];
              const studentDocId = studentDoc.id;
  
              // 🔥 Delete from student's `LinkedParent` subcollection
              const linkedParentRef = doc(db, "students", studentDocId, "LinkedParent", parentId);
              await deleteDoc(linkedParentRef);
  
              // 🔥 Delete from parent's `LinkedStudent` subcollection
              const linkedStudentRef = doc(db, "parent", parentId, "LinkedStudent", studentDocId);
              await deleteDoc(linkedStudentRef);
  
              console.log("✅ Parent successfully unlinked from both student and parent collections.");
              Toast.show({ type: "success", text1: "Parent unlinked successfully" });
  
              // Update local state to reflect the change
              setLinkedParents((prevParents) => prevParents.filter((parent) => parent.id !== parentId));
            }
          } catch (error) {
            console.error("❌ Error unlinking parent:", error);
            Toast.show({ type: "error", text1: "Failed to unlink parent" });
          }
        },
      },
    ]);
  };
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate("StudentPage")}>
          <Image source={require("../images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Image source={require("../images/logo.png")} style={styles.logo} />
          <Image source={require("../images/GateSync.png")} style={styles.gatesync} />
        </View>
        <TouchableOpacity onPress={() => console.log("Profile pressed")}>
          <Image source={require("../images/account.png")} style={styles.profileIcon} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Linked Parents</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#5394F2" style={styles.loader} />
        ) : linkedParents.length > 0 ? (
          linkedParents.map((parent) => (
            <View key={parent.id} style={styles.parentCard}>
              <View style={styles.parentHeader}>
                <Image source={require("../images/account_circle.png")} style={styles.parentAvatar} />
                <Text style={styles.parentName}>{parent.username}</Text>
              </View>
              <Text style={styles.parentInfo}>📧 {parent.email}</Text>
              <Text style={styles.parentInfo}>📞 {parent.contactNumber || "N/A"}</Text>

              <TouchableOpacity style={styles.unlinkButton} onPress={() => unlinkParent(parent.id)}>
                <Text style={styles.unlinkText}>Unlink Parent</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noResults}>No linked parents found</Text>
        )}
      </ScrollView>

      {/* Toast Notification */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#BCE5FF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
  },

  navCenter: { flexDirection: "row", alignItems: "center" },
  logo: { width: 35, height: 35, resizeMode: "contain", marginRight: 10 },
  gatesync: { width: 100, height: 35, resizeMode: "contain" },
  backIcon: { width: 30, height: 30, resizeMode: "contain" },
  profileIcon: { width: 30, height: 30, resizeMode: "contain" },

  content: { padding: 20, alignItems: "center" },

  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 },
  loader: { marginTop: 50 },

  parentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 15,
  },

  parentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  parentAvatar: { width: 70, height: 70, borderRadius: 50, marginRight: 15 },
  parentName: { fontSize: 20, fontWeight: "600", color: "#333" },
  parentInfo: { fontSize: 16, color: "#666", marginVertical: 3 },

  unlinkButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
  },

  unlinkText: { fontSize: 16, fontWeight: "600", color: "#FFF" },

  noResults: { fontSize: 16, color: "#999", marginTop: 20 },
});

export default LinkedParent;
