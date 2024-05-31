import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import axios from 'axios';

const NewMessageScreen = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFollowers, setFilteredFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/followers'); // Adjust this endpoint
        setFollowers(response.data);
        setFilteredFollowers(response.data);
      } catch (error) {
        console.error('Failed to fetch followers:', error);
      }
    };

    fetchFollowers();
  }, []);

  useEffect(() => {
    setFilteredFollowers(
      followers.filter(follower =>
        follower.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, followers]);

  const handlePressFollower = (follower) => {
    // Implement logic to start a new chat with the selected follower
  };

  const renderFollowerItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePressFollower(item)}>
      <View style={styles.followerItem}>
        <Image
          style={styles.followerImage}
          source={{ uri: item.profile_pic_url }}
        />
        <Text style={styles.followerName}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require('./assets/back_arrow.png')}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search followers..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredFollowers}
        keyExtractor={(item) => item.pk.toString()}
        renderItem={renderFollowerItem}
      />
    </View>
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
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
  },
  followerItem: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  followerImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  followerName: {
    fontSize: 18,
  },
});

export default NewMessageScreen;
