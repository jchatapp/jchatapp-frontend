import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import axios from 'axios';
import config from './config';

const EditUserListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userList, userpk } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [localUserList, setLocalUserList] = useState(userList);

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

  return (
    <View style={{ flex: 1 }}>
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
      <FlatList
        data={filteredUserList}
        renderItem={renderUserItem}
        keyExtractor={item => item.pk.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 57,
    backgroundColor: '#f0f0f0'
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
    borderBottomColor: '#ccc'
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
});

export default EditUserListScreen;
