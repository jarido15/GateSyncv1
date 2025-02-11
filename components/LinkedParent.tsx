import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast

const LinkedParent = ({ navigation }) => {
  const [isAdded, setIsAdded] = useState(false);

  const toggleIcon = () => {
    // Show Toast on toggle action after state change
    setIsAdded(prevState => {
      const newState = !prevState;
      if (newState) {
        Toast.show({
          type: 'success', // You can change the type if you prefer
          text1: 'Account removed successfully',
        });
      } else {
        Toast.show({
          type: 'error', // You can change the type if you prefer
          text1: 'Account removed successfully',
        });
      }
      return newState; // Update the state after showing the toast
    });
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.navigate('StudentPage')}>
            <Image
              source={require('../images/back.png')} // Replace with your back icon image path
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
          <TouchableOpacity onPress={() => console.log('Profile pressed')}>
            <Image
              source={require('../images/account.png')} // Replace with your profile icon image path
              style={styles.profileIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Message container with conditional rendering of elements */}
        <View style={styles.messagecontainer}>
          {!isAdded && (
            <>
              <View style={styles.chatbar} />
              <Text style={styles.chatname}>John Padilla</Text>
              <View style={styles.chatcircle}>
                <Image
                  source={require('../images/account_circle.png')}
                  style={styles.chatIcon}
                />
                <TouchableOpacity onPress={toggleIcon}>
                  <Image
                    source={require('../images/minus.png')} // Replace with your "minus" icon path
                    style={styles.addicon}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.bar} />
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Linked Accounts</Text>
        </View>
      </ScrollView>
      {/* Toast Component */}
      <Toast />
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
  },
  back: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  profileIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  content: {
    marginTop: 20,
    padding: 20,
  },
  bar: {
    height: 54,
    width: '90%',
    backgroundColor: '#6B9BFA',
    alignSelf: 'center',
    borderRadius: 21,
    padding: 15,
    top: '-30%',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  chatIcon: {
    width: 104,
    height: 104,
    top: -15,
    right: 15,
  },
  addicon: {
    width: 33,
    height: 33,
    top: -45,
    right: 10,
  },
  chatcircle: {
    backgroundColor: '#fff',
    width: 81,
    height: 75,
    borderRadius: 50,
    top: 5,
    right: -30,
  },
  chatname: {
    fontFamily: 'Kanit',
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
    alignSelf: 'center',
    textAlign: 'auto',
    top: 50,
  },
  chatbar: {
    backgroundColor: '#6b9bfa',
    width: '80%',
    height: 48,
    borderRadius: 21,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    alignContent: 'center',
    top: '45%',
  },
  messagecontainer: {
    backgroundColor: '#CFE5FF',
    width: '90%',
    height: 206,
    borderRadius: 21,
    alignSelf: 'center',
    top: '20%',
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'Kanit',
    color: '#5394F2',
    bottom: 290,
  },
});

export default LinkedParent;
