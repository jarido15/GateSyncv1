import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';

const ChatPage = ({ navigation }) => {
  const [messages, setMessages] = useState([]); // Store messages
  const [newMessage, setNewMessage] = useState(''); // Store new message input

  // Function to send a new message
  const sendMessage = () => {
    const message = newMessage.trim();

    // Only add the message if it's not empty
    if (message) {
      const newMessageObject = { id: String(messages.length), text: message }; // Ensure id is string
      setMessages([...messages, newMessageObject]); // Append the new message at the end
      setNewMessage(''); // Clear the input field after sending
    }
  };

  // Render each message item in the chat list
  const renderItem = ({ item }) => {
    if (!item || typeof item.text !== 'string') {
      return null; // Do not render invalid items
    }

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Navigation Bar */}
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.navigate('ParentPage', { screen: 'Messages' })}>
              <Image
                source={require('../images/back.png')} // Replace with your back icon image path
                style={styles.back}
              />
            </TouchableOpacity>
            <Text style={styles.name}>John Doe</Text>
            <Image source={require('../images/accountcircle.png')} style={styles.account} />
          </View>

          {/* Chat messages list */}
          <FlatList
            data={[...messages].reverse()} // Reverse the order of messages
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            keyboardShouldPersistTaps="handled"
            style={styles.chatContainer}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Message Input Section wrapped in KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior for iOS and Android
        style={styles.inputContainer}
      >
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
    color: 'white',
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
});

export default ChatPage;
