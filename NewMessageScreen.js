import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native';
import axios from 'axios';
import config from './config';

const NewMessageScreen = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [noUserFound, setNoUserFound] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    setDebounceTimeout(
      setTimeout(() => {
        searchUsers();
      }, 500)
    );
  }, [searchQuery]);

  const searchUsers = async () => {
    if (searchQuery) {
      setIsLoading(true);  
      try {
        const response = await axios.get(config.API_URL + `/searchUser?username=${searchQuery}`);
        if (response.data) {
          setFilteredUsers([response.data]);
          setNoUserFound(false);
        }
        setIsLoading(false); 
      } catch (error) {
        setIsLoading(false);  
        if (error.response && error.response.status === 404) {
          setFilteredUsers([]);
          setNoUserFound(true);
        } else {
          console.error('Failed to search users:', error);
          Alert.alert('Error', 'Failed to fetch user data.');
        }
      }
    } else {
      setFilteredUsers(users);
      setNoUserFound(false);
    }
  };

  const handlePressUser = (user) => {
    setSelectedUsers(prevState => {
      if (prevState.some(selectedUser => selectedUser.pk === user.pk)) {
        return prevState.filter(selectedUser => selectedUser.pk !== user.pk);
      } else {
        return [...prevState, user];
      }
    });
  };

  const handleRemoveSelectedUser = (user) => {
    setSelectedUsers(prevState => prevState.filter(selectedUser => selectedUser.pk !== user.pk));
  };

  const createChat = () => {
    console.log("Chat created with selected users.");
    // TODO: CREATE CHAT
  };

  const renderSelectedUserItem = ({ item }) => (
    <View style={styles.selectedUserItem}>
      <Image style={styles.selectedUserImage} source={{ uri: item.profile_pic_url }} />
      <Text style={styles.selectedUserName}>{item.username}</Text>
      <TouchableOpacity onPress={() => handleRemoveSelectedUser(item)} style={styles.removeButton}>
        <Image style={styles.closebutton} source={require("./assets/close.png")} />
      </TouchableOpacity>
    </View>
  );

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.some(selectedUser => selectedUser.pk === item.pk);
    return (
      <TouchableOpacity onPress={() => handlePressUser(item)}>
        <View style={styles.userItem}>
          <Image style={styles.userImage} source={{ uri: item.profile_pic_url }} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.username}</Text>
            {item.is_verified && (
              <Image style={styles.verificationIcon} source={require('./assets/verified.png')} />
            )}
          </View>
          <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('./assets/back_arrow.png')} style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="To: Search"
        value={searchQuery}
        onChangeText={(text) => {
          setNoUserFound(false);  
          setSearchQuery(text);
        }}
      />
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {selectedUsers.length > 0 && (
          <>
            <FlatList
              horizontal
              data={selectedUsers}
              keyExtractor={(item) => item.pk.toString()}
              renderItem={renderSelectedUserItem}
              style={{ flexGrow: 0 }}
              showsHorizontalScrollIndicator={false}
            />
          </>
        )}
        {isLoading ? (
          <ActivityIndicator size="small" color="#333" style={{ marginTop: 10 }} />
        ) : noUserFound ? (
          <Text style={styles.noUserText}>No user found.</Text>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.pk.toString()}
            renderItem={renderUserItem}
            style={{ flex: 1 }}
          />
        )}
      </View>
      {selectedUsers.length > 0 && (
          <TouchableOpacity onPress={createChat} style={styles.createChatButton}>
            <Text style={styles.createChatButtonText}>Create Chat</Text>
          </TouchableOpacity>
        )}
    </KeyboardAvoidingView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchBar: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginHorizontal: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  selectedUserItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  createChatButton: {
    padding: 10,
    margin: 10,
  },
  selectedUserImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  selectedUserName: {
    fontSize: 12,
    
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
  },
  closebutton: {
    height: 15,
    width: 15,
    padding: 2
  },
  noUserText: {
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 12
  },
  userItem: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
  },
  verificationIcon: {
    width: 15,
    height: 15,
    marginLeft: 5,
    marginTop: 5
  },
  selectionCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedCircle: {
    backgroundColor: '#007AFF',
  },
  createChatButton: {
    backgroundColor: 'gray',  
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 50,
    alignSelf: 'center', 
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  createChatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',  
  },
});

export default NewMessageScreen;
