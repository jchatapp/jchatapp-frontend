import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import axios from 'axios';
import config from './config';

const EditUserListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userList, userpk } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [localUserList, setLocalUserList] = useState(userList);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [noUserFound, setNoUserFound] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [privateUsers, setPrivateUsers] = useState([]);

  const filteredUserList = localUserList.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function deleteUserFromList(pk) {
    try {
      const response = await fetch(`${config.API_URL}/deleteuserfromlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userpk, del_user_pk: pk })
      });
      if (response.ok) {
        const updatedUserList = localUserList.filter(user => user.pk !== pk);
        setLocalUserList(updatedUserList);
      } else {
        throw new Error('Failed to delete the user.');
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  const renderRightActions = (progress, dragX, pk) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View style={[styles.rightAction, { opacity: opacity }]}>
        <TouchableOpacity
          onPress={() => deleteUserFromList(pk)}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.Text style={[styles.actionText, { transform: [{ scale: scale }] }]}>
            Delete
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderUserItem = ({ item }) => {
    return (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.pk)}
      >
        <View style={styles.itemContainerforitems}>
          <Image style={styles.profileImageUserList} source={{ uri: item.profile_pic_url }} />
          <View style={styles.textContainerUserList}>
            <Text style={styles.usernameUserList}>{item.username}</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  const addUsertoList = async () => {
    try {
      const privateUserList = checkPrivateUsers(selectedUsers);
      if (privateUserList.length > 0) {
        throw new Error(`Cannot add private users you are not following: ${privateUserList.join(', ')}`);
      }
      await axios.post(config.API_URL + '/addusertolist', {
        userId: userpk,
        usersList: selectedUsers
      });
      setLocalUserList([...localUserList, ...selectedUsers]);
      setSelectedUsers([]);
      setSearchQuery('');
    } catch (error) {
      alert(error.message);
    }
  };

  function checkPrivateUsers(selectedUsers) {
    let tempPrivateUsers = [];
    for (const user of selectedUsers) {
      if (!user.friendship_status.following && user.friendship_status.is_private) {
        tempPrivateUsers.push(user.username);
      }
    }
    setPrivateUsers(prevUsers => [...prevUsers, ...tempPrivateUsers]);
    return tempPrivateUsers;
  }

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

  const renderSelectedUserItem = ({ item }) => (
    <View style={styles.selectedUserItem}>
      <Image style={styles.selectedUserImage} source={{ uri: item.profile_pic_url }} />
      <Text style={styles.selectedUserName}>{item.username}</Text>
      <TouchableOpacity onPress={() => handleRemoveSelectedUser(item)} style={styles.removeButton}>
        <Image style={styles.closebutton} source={require("./assets/close.png")} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchUserItem = ({ item }) => {
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
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={require('./assets/back_arrow.png')}
            style={{ width: 20, height: 20, marginLeft: 10 }}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.searchContainer}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {filteredUserList.length > 0 ? (
          <FlatList
            data={filteredUserList}
            renderItem={renderUserItem}
            keyExtractor={item => item.pk.toString()}
          />
      ) : (
        <>
         {
          searchQuery.length > 0 ? (
            <Text style={styles.searchQueryText}>Search results for "{searchQuery}"</Text>
          ) : null
         }
          <FlatList
            horizontal
            data={selectedUsers}
            keyExtractor={(item) => item.pk.toString()}
            renderItem={renderSelectedUserItem}
            style={{ flexGrow: 0 }}
            showsHorizontalScrollIndicator={false}
          />
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#333" style={{ marginTop: 10 }} />
            ) : noUserFound ? (
              <Text style={styles.noUserText}>No user found.</Text>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.pk.toString()}
                renderItem={renderSearchUserItem}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </>
      )}
      {selectedUsers.length > 0 && (
        <TouchableOpacity onPress={addUsertoList} style={styles.createChatButton}>
          <Text style={styles.sendButtonText}>Add User</Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 57,
    backgroundColor: 'white'
  },
  backButton: {
    padding: 5
  },
  searchContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 5,
    marginHorizontal: 10,
    height: 40
  },
  itemContainerforitems: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileImageUserList: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  textContainerUserList: {
    flex: 1,
  },
  usernameUserList: {
    fontSize: 16,
    color: 'black'
  },
  rightAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    maxWidth: '25%'
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center'
  },
  selectedUserItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  selectedUserImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#d3d3d3',
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
    borderWidth: 1,
    borderColor: '#d3d3d3'
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
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
  searchQueryText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: 'gray'
  },
});

export default EditUserListScreen;
