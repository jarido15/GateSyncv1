import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../components/firebase";
import { getAuth } from "firebase/auth";

const ChatPage = ({ navigation, route }) => {
  const { user } = route.params; // Receiver's user data
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Get current user's ID
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  if (!currentUserId) {
    return <Text>Loading...</Text>; // Handle case where user is not logged in
  }

  // Generate unique chat ID (same for both users)
  const chatId = currentUserId < user.id ? `${currentUserId}_${user.id}` : `${user.id}_${currentUserId}`;

  // Fetch messages in real-time
  useEffect(() => {
    const messagesRef = collection(db, 'Chats', chatId, 'Messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, [chatId]);

  // Function to send a new message
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const messagesRef = collection(db, 'Chats', chatId, 'Messages');
    await addDoc(messagesRef, {
      text: newMessage,
      senderId: currentUserId,
      receiverId: user.id,
      timestamp: serverTimestamp(),
    });

    setNewMessage(''); // Clear input field after sending
  };

  // Render chat messages
  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.senderId === currentUserId ? styles.sentMessage : styles.receivedMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

   return (
      <View style={styles.container}>
        {/* Dismiss keyboard when tapping outside */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Navigation Bar */}
            <View style={styles.navbar}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={require('../images/back.png')} style={styles.back} />
              </TouchableOpacity>
              <Text style={styles.name}>{user.username || 'Unknown User'}</Text>
              <Image source={require('../images/accountcircle.png')} style={styles.account} />
            </View>
  
            {/* Chat messages list */}
            <FlatList
              data={messages} // Firestore is already ordered
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatList}
              keyboardShouldPersistTaps="handled"
              style={styles.chatContainer}
            />
          </View>
        </TouchableWithoutFeedback>
  
        {/* Message Input Section */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={'#686D76'}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Image source={require('../images/send.png')} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
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
    name: {
      color: '#404B7C',
      fontSize: 11,
      fontWeight: '900',
      fontFamily: 'Kanit',
      alignSelf: 'center',
      top: 15,
    },
    account: {
      left: -165,
      top: -5,
    },
    back: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    chatContainer: {
      flex: 1,
      padding: 10,
    },
    chatList: {
      flexGrow: 1,
      justifyContent: 'flex-end', // Keeps chat list at the bottom by default
    },
    messageContainer: {
      backgroundColor: '#5394F2',
      padding: 10,
      marginVertical: 5,
      borderRadius: 10,
      alignSelf: 'flex-end',
      maxWidth: '80%',
    },
    messageText: {
      color: 'black',
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#ddd',
    },
    input: {
      flex: 1,
      height: 50,
      borderColor: '#ddd',
      borderWidth: 2,
      backgroundColor: '#F6F6F6',
      borderRadius: 30,
      paddingHorizontal: 15,
      fontSize: 16,
    },
    sendButton: {
      marginLeft: 10,
      padding: 10,
      borderRadius: 50,
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#5394F2',
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#E1E1E1',
    },
  });

  export default ChatPage;
