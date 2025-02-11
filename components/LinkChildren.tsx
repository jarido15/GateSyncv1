import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast

const LinkedParent = ({ navigation }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for the search query

  const toggleIcon = () => {
    setIsAdded(!isAdded);
    if (!isAdded) {
      Toast.show({
        type: 'success', // or 'error', 'info'
        text1: 'Parent Linked Successfully',
      });
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text); // Update search query
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.navigate('ParentPage')}>
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
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Image source={require('../images/search.png')} style={styles.searchicon}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
          />
        </View>

        {/* Message Container */}
        <View style={styles.messagecontainer}>
          <TouchableOpacity onPress={() => navigation.navigate('ParentChatPage')}>
            <View style={styles.chatbar} />
            <Text style={styles.chatname}>John Padilla</Text>
            <View style={styles.chatcircle}>
              <Image
                source={require('../images/account_circle.png')}
                style={styles.chatIcon}
              />
              <TouchableOpacity onPress={toggleIcon}>
                <Image
                  source={
                    isAdded
                      ? require('../images/checked.png') // Replace with your "check" icon path
                      : require('../images/add.png') // Replace with your "add" icon path
                  }
                  style={styles.addicon}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.content}/>
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
  profileIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  content: {
    marginTop: 20,
    padding: 20,
  },
  chatIcon: {
    width: 104,
    height: 104,
    top: -15,
    right: 15,
  },
  addicon: {
    width: 34,
    height: 33,
    top: -45,
    right: 10,
  },
  chatcircle: {
    backgroundColor: '#fff',
    width: 81,
    height: 75,
    borderRadius: 50,
    top: -45,
    right: -30,
  },
  chatname: {
    fontFamily: 'Kanit',
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
    alignSelf: 'center',
    textAlign: 'auto',
    top: 5,
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
    top: '28%',
  },
  messagecontainer: {
    backgroundColor: '#CFE5FF',
    width: '90%',
    height: 206,
    borderRadius: 21,
    alignSelf: 'center',
    top: '5%',
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
  searchContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#6B9BFA',
    height: 60,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 50,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    width: '90%',
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#6B9BFA',
    paddingLeft: 10,
    backgroundColor: '#fff',
    top: '-37%',
    right: -20,
  },
  searchicon:{
    width: 30,
    height: 30,
    right: 150,
    top: '25%',
  },
});

export default LinkedParent;
