import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, TextInput } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const ChatListScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatList, setChatList] = useState(route.params.chatList);
  const { userInfo } = route.params;
  const isFocused = useIsFocused();
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchChatList();
      setPolling(true);
    } else {
      setPolling(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (polling) {
      const interval = setInterval(() => {
        fetchChatList();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [polling]);

  const fetchChatList = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8000/chats`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat list');
      }
      const data = await response.json();
      setChatList(data);
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
    }
  };

  const fetchChatMessages = async (threadId) => {
    try {
      const response = await fetch(`http://10.0.2.2:8000/chats/${threadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      return await response.json();  
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  const markAsSeen = async (threadId, itemId) => {
    try {
      await fetch(`http://10.0.2.2:8000/chats/${threadId}/seen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId }),
      });
    } catch (error) {
      console.error('Failed to mark message as seen:', error);
    }
  };

  const handlePressChatItem = async (item) => {
    setPolling(false);
    const chatMessages = await fetchChatMessages(item.thread_id);
    if (chatMessages) {
      navigation.navigate('ChatMessages', { chatList: chatMessages });
      if (item.items && item.items[0]) {
        await markAsSeen(item.thread_id, item.items[0].item_id);
        updateChatList(item.thread_id);
      }
    }
  };

  const updateChatList = (threadId) => {
    setChatList(prevChatList =>
      prevChatList.map(chat =>
        chat.thread_id === threadId ? { ...chat, read_state: 0 } : chat
      )
    );
  };

  const filteredChatList = chatList.filter(item =>
    item.thread_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const GroupProfilePics = ({ chatList }) => {
    if (chatList.users.length < 2) {
      return null; 
    }
  
    return (
      <View style={styles.profilePicContainer}>
        <Image
          source={{ uri: chatList.users[0].profile_pic_url }}
          style={styles.profilePicBack}
        />
        <Image
          source={{ uri: chatList.users[1].profile_pic_url }}
          style={styles.profilePicFront}
        />
      </View>
    );
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePressChatItem(item)}>
      <View style={styles.chatItem}>
        {item.is_group ? (
          <GroupProfilePics chatList={item} />
        ) : (
          <Image
            style={styles.chatImage}
            source={{ uri: item.users[0].profile_pic_url }}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.chatTitle, item.read_state === 1 ? styles.boldText : null]}>
            {item.thread_title}
          </Text>
          <Text style={[styles.chatSnippet, item.read_state === 1 ? styles.boldText : null]}>
            {item.last_permanent_item.is_sent_by_viewer ? `You: ${item.last_permanent_item.text ? item.last_permanent_item.text : `${item.thread_title} sent an attachment`}` : item.last_permanent_item.text ? item.last_permanent_item.text : `${item.thread_title} sent an attachment`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfoContainer}>
      <Image style={styles.profileImage} source={{ uri: userInfo.profile_pic_url }} />
      <View style={styles.userInfoTextContainer}>
        <Text style={styles.userName}>{userInfo.full_name}</Text>
        <TouchableOpacity style={styles.button} onPress={() => console.log('Edit close following')}>
          <Text style={styles.buttonText}>Edit close following</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'empty' && styles.activeTab]}
          onPress={() => setActiveTab('empty')}
        >
          <Text style={styles.tabText}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={styles.tabText}>Messages</Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'messages' ? (
        <>
          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredChatList}
            keyExtractor={(item) => item.thread_id}
            renderItem={renderChatItem}
          />
        </>
      ) : (
        <View style={styles.activityContainer}>
          {renderUserInfo()}
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content available.</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabsContainer: {
    paddingTop: 40,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'red',
  },
  searchBar: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  chatImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: 18,
  },
  chatSnippet: {
    fontSize: 14,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  activityContainer: {
    padding: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  userInfoTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  userFollowing: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profilePicContainer: {
    flexDirection: 'row',
    position: 'relative',
    height: 50, 
    width: 60, 
    alignItems: 'center',
  },
  profilePicBack: {
    width: 40,
    height: 40, 
    borderRadius: 20, 
  },
  profilePicFront: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: "white",
    position: 'absolute',
    left: 10,
    top: 10, 
    zIndex: 1,
  }
});

export default ChatListScreen;
