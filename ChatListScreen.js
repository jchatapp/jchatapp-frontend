import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, TextInput, Animated, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import ActionSheet from 'react-native-actionsheet';
import { LogBox } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { Video } from 'expo-av';
import config from './config';
import { Swipeable } from 'react-native-gesture-handler';
import {getCurrentTimestampMicro} from './utils';
LogBox.ignoreLogs(['Animated: `useNativeDriver`']);

const ChatListScreen = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const userpk = userInfo.pk;
  const initialUserList = route.params.userList ? route.params.userList.usersList : [];
  const [userPostList, setUserPostList] = useState(route.params.userPostList);
  const [userList, setUserList] = useState(initialUserList);
  const [chatList, setChatList] = useState(route.params.chatList);
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [polling, setPolling] = useState(true);
  const [chatMap, setChatMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const actionSheetRef = useRef();
  const isFocused = useIsFocused();
  const ref = useRef( null );
  const isFocusedActivity = useIsFocused();

  const handleLogout = async () => {
    try {
      const response = await axios.post(config.API_URL + '/logout');
      if (response.status === 200) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'LoginScreen' },
            ],
          })
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Failed to logout:', error.message);
    }
  };

  const handleGearPress = () => {
    actionSheetRef.current.show();
  };

  const handleActionSheetPress = (index) => {   
    if (index === 1) { 
      handleLogout();
    }
  };

  const handleAddPress = () => {
    navigation.navigate('NewMessageScreen', { userInfo, navigation });  
  };

  // Set Polling to false when not on ChatListScreen
  useEffect(() => {
    if (isFocused && activeTab === 'messages') {
      fetchChatList();
      setPolling(true);
    } else {
      setPolling(false);
    }
  }, [isFocused, activeTab]);

  // Set polling interval for 10s
  useEffect(() => {
    if (polling) {
      const interval = setInterval(() => {
        fetchChatList();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [polling]);

  // Call igClient.feed.directInbox().items() asynchronously
  const fetchChatList = async () => {
    try {
      const response = await fetch(config.API_URL + `/chats`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat list');
      }
      const newData = await response.json();
      processChatList(newData);
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
    }
  };

  const processChatList = (newData) => {
    setChatList(prevChatList => {
      const newMap = { ...chatMap };
      let listChanged = false;

      newData.forEach(item => {
        const lastItem = item.items[0] ? item.items[0].item_id : null;
        if (!newMap[item.thread_id] || newMap[item.thread_id] !== lastItem) {
          newMap[item.thread_id] = lastItem;
          listChanged = true;
        }
      });

      if (listChanged) {
        setChatMap(newMap);
        processUserMap(newData);
        return newData;  
      }
      return prevChatList;
    });
  };

  const processUserMap = (chatData) => {
    const newUserMap = { ...userMap };

    chatData.forEach(chat => {
      chat.users.forEach(user => {
        if (!newUserMap[user.username]) {
          newUserMap[user.username] = user.pk;
        }
      });
    });
    
    setUserMap(newUserMap);
  };

  const updateChatList = (threadId) => {
    setChatList(prevChatList =>
      prevChatList.map(chat =>
        chat.thread_id === threadId ? { ...chat, read_state: 0 } : chat
      )
    );
  };

  useEffect(() => {
    if (isFocusedActivity) {
      fetchUserList();
    }
  }, [isFocused]);

  //get usersList from db where key = userInfo.pk
  const fetchUserList = async () => {
    try {
      const response = await fetch(config.API_URL + `/getUserList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userInfo.pk })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user list');
      }
      const newData = await response.json();
      if (newData.response) {
        setUserList(newData.response.usersList);
      }
    } catch (error) {
      console.error('Failed to fetch user list:', error);
    }
  };  

  // fetch chat messages on click of given chat
  const fetchChatMessages = async (threadId) => {
    try {
      const response = await fetch(config.API_URL + `/chats/${threadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      return await response.json();  
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  // Mark unread chat as seen, pass in threadID, itemID of most recent item
  const markAsSeen = async (threadId, itemId) => {
    try {
      await fetch(config.API_URL + `/chats/${threadId}/seen`, {
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

  const deleteChat = async (threadId) => {
    try {
      const response = await fetch(`${config.API_URL}/delete?thread_id=${threadId}`, { method: 'POST' });
      if (response.ok) {
        setChatList(prevChatList => prevChatList.filter(chat => chat.thread_id !== threadId));
      } else {
        throw new Error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // render delete button on left swipe of chat
  const renderRightActions = (progress, dragX, threadId) => {
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
              onPress={() => deleteChat(threadId)}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Text style={[styles.actionText,{ transform: [{ scale: scale }] }]}>
              Delete
            </Animated.Text>
          </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const filteredChatList = chatList.filter(item =>
    item.thread_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterUserStoriesByTimestamp = (userStories, timestamp) => {
    return userStories.filter(story => story.device_timestamp > timestamp);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      console.log('List refreshed');
    }, 2000);
  };

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

  const getTimeAgo = (timestampMicroseconds) => {
    const timestamp = timestampMicroseconds / 1000;
    const now = Date.now();
    const secondsAgo = Math.floor((now - timestamp) / 1000);
  
    if (secondsAgo < 60) return `${secondsAgo}s`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo}m`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h`;
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) return `${daysAgo}d`;
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${weeksAgo}w`;
  };

  const renderChatItem = ({ item }) => {
    const getUsernameById = (userId) => userMap[userId] || 'Unknown';
  
    const renderItemContent = () => {
      const { item_type, text, user_id, action_log, timestamp } = item.last_permanent_item;
      const timeAgo = getTimeAgo(timestamp);
  
      switch (item_type) {
        case "text":
          return (
            <Text style={[styles.chatSnippet, item.read_state === 1 ? styles.boldText : null]} numberOfLines={2}>
              {text}  <Text style={styles.timeStyle}>• {timeAgo}</Text>
            </Text>
          );
        case "action_log":
          return (
            <Text style={[styles.chatSnippet, item.read_state === 1 ? styles.boldText : null]} numberOfLines={2}>
              {action_log.description}  <Text style={styles.timeStyle}>• {timeAgo}</Text>
            </Text>
          );
          
        default:
          const username = getUsernameById(user_id);
          const message = username === 'Unknown' ? "Sent an attachment" : `${username} sent an attachment`;
          return (
            <Text style={[styles.chatSnippet, item.read_state === 1 ? styles.boldText : null]} numberOfLines={2}>
              {message}  <Text style={styles.timeStyle}>• {timeAgo}</Text>
            </Text>
          );
      }
    };
  
    return (
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.thread_id)}
      >
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
              {renderItemContent()}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };
  

  const updateUserPostList = (newUserPostList) => {
    setUserPostList(newUserPostList);
  };

  const renderUserInfo = () => {
    return (
      <View style={styles.userInfoContainer}>
        <Image style={styles.profileImage} source={{ uri: userInfo.profile_pic_url }} />
        <View style={styles.userInfoTextContainer}>
          <Text style={styles.userName}>{userInfo.username}</Text>
          <Text style={styles.userStats}>Followers: {userInfo.follower_count} | Following: {userInfo.following_count}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('EditUserListScreen', {
              userList, 
              userpk, 
              userPostList, 
              onUserPostListUpdate: updateUserPostList
            })}
          >
            <Text style={styles.buttonText}>Edit close following</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  async function handleStories(stories) {
    try {
      const response = await axios.post(config.API_URL + '/setStoryTimestamp', {
        userpk: userpk,
        stories: stories[0].id,
        lastSeenTimestamp: getCurrentTimestampMicro()
      });
  
      const updatedUserPostList = {
        ...userPostList,
        [stories[0].id]: {
          ...userPostList[stories[0].id],
          storyCursor: getCurrentTimestampMicro(),
        }
      };
      
      setUserPostList(updatedUserPostList);
      navigation.navigate('StoriesScreen', { stories, navigation });
    } catch (error) {
      console.error(error);
    }
  }
  
  const renderUserItem = ({ item }) => {
    let filteredStories = [];
    let allstories = userPostList[item.pk]?.userStories;
  
    if (userPostList[item.pk]?.userStories.length > 0) {
      filteredStories = filterUserStoriesByTimestamp(userPostList[item.pk].userStories, userPostList[item.pk].storyCursor);
    }
  
    const hasFilteredStories = filteredStories.length > 0;
  
    const stories = [{
      id: item.pk.toString(),
      name: item.username,
      imgUrl: item.profile_pic_url,
      stories: allstories.map(story => ({
        id: story.id.toString(),
        source: {
          uri: story.media_type === 1 ? story.image_versions2.candidates[0].url : story.video_versions[0].url
        },
        mediaType: story.media_type === 1 ? 'image' : 'video'
      })),
    }];
  
    const getBorderStyle = () => {
      if (userPostList[item.pk]?.userStories.length > 0) {
        return hasFilteredStories ? styles.outerBorder : styles.outerBorderPurple;
      }
      return styles.outerBorderInvis;
    };
  
    return (
      <View style={styles.itemContainerforitems}>
        <TouchableOpacity
          style={styles.profileTouchArea}
          onPress={() => {
            if (userPostList[item.pk]?.userStories.length > 0) {
              handleStories(stories);
            }
          }}
        >
          <View style={getBorderStyle()}>
            <View style={styles.middleBorder}>
              <Image
                style={styles.profileImageUserList}
                source={{ uri: item.profile_pic_url }}
              />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.textContainerUserList}
          onPress={() => updateTimestamp(item)}
        >
          <Text style={styles.usernameUserList}>{item.username}</Text>
          {userPostList[item.pk].newPosts.length > 0 && (
            <Text style={styles.userListInforTextBold}>
              {userPostList[item.pk].newPosts.length} New Posts {hasFilteredStories ? `• ${filteredStories.length} New Stories` : ''}
            </Text>
          )}
          {!hasFilteredStories && userPostList[item.pk].newPosts.length === 0 && (
            <Text style={styles.userListInforText}>
              No New Posts
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  
  async function updateTimestamp(item) {
    try {
        const response = await axios.post(config.API_URL + '/setTimestampandSeen', {
            userpk: userpk,
            itempk: item.pk,
            lastSeenTimestamp: getCurrentTimestampMicro()
        });
        
        const postlist = userPostList[item.pk];
        const updatedPostlist = {
            ...postlist,
            oldPosts: [...postlist.oldPosts, ...postlist.newPosts],
            newPosts: []
        };
        
        const updatedUserPostList = {
            ...userPostList,
            [item.pk]: updatedPostlist
        };
        
        setUserPostList(updatedUserPostList);
        
        navigation.navigate('TimelineDisplay', { postlist: postlist, item });
    } catch (error) {
        console.error(error);
    }
}

useEffect(() => {
  if (userList && userPostList) {
    const sortedList = [...userList].sort((a, b) => {
      const aNewPosts = userPostList[a.pk]?.newPosts?.length || 0;
      const bNewPosts = userPostList[b.pk]?.newPosts?.length || 0;

      if (aNewPosts !== bNewPosts) {
        return bNewPosts - aNewPosts; 
      }

      const aStories = userPostList[a.pk]?.userStories?.length || 0;
      const bStories = userPostList[b.pk]?.userStories?.length || 0;
      return bStories - aStories; 
    });

    if (JSON.stringify(sortedList) !== JSON.stringify(userList)) {
      setUserList(sortedList);
    }
  }
}, [userPostList, userList]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGearPress}>
          <Image
            source={require('./assets/gear.png')}
            style={styles.headerButtons}
          />
        </TouchableOpacity>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
        />
        {activeTab === 'messages' ? (
          <TouchableOpacity onPress={handleAddPress}>
          <Image
            source={require('./assets/plus.png')}
            style={styles.headerButtons}
          />
        </TouchableOpacity>
        ):<View style={styles.headerButtons}> 
          </View>}
      </View>
      <ActionSheet
        ref={actionSheetRef}
        title={'Settings'}
        options={['Cancel', 'Logout']}
        cancelButtonIndex={0}
        destructiveButtonIndex={1}
        onPress={handleActionSheetPress}
      />

      <View style={styles.separatorLine}></View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
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
        <>
          {renderUserInfo()}
          {userList.length === 0 ? (
            <View style={styles.emptyUserListContainer}>
              <Text style={styles.noUserEmptyText}>User list is empty</Text>
            </View>
          ) : (
            <FlatList
            data={userList}
            keyExtractor={(item) => item.pk.toString()}
            renderItem={renderUserItem}
            onEndReachedThreshold={1}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.userListContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyUserListContainer}>
                <Text style={styles.noUserEmptyText}>No users found</Text>
              </View>
            )}
          />
          )}
        </>
      )}
      </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50, 
    backgroundColor: 'white',
    width: '100%',
  },
  headerButtons: {
    width: 25,
    height: 25,
    marginHorizontal: 10,
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tab: {
    flex: 1,
    padding: 10,
    paddingVertical: 15, 
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'red',
  },
  searchBar: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  chatImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1, 
    borderColor: '#d3d3d3', 
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
    width: 90,
    height: 90,
    borderRadius: 50,
    marginRight: 20,
  },
  userInfoTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  userStats: {
    fontSize: 16,
    color: 'gray',
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
  },
  separatorLine: {
    height: 1,           
    backgroundColor: 'gray', 
    width: '100%',     
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
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    minWidth: '100%',
    maxHeight: '70%'
  },
  itemContainerforitems: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: '100%',
    alignItems: 'center',
    minHeight: 80, 
  },
  textContainerUserList: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1, 
  },
  profileImageUserList: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1, 
    borderColor: '#d3d3d3', 
  },
  usernameUserList: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20
  },
  userListInforText: {
    fontSize: 14,
    marginLeft: 20,
    color: 'gray'
  },
  userListInforTextBold: {
    fontSize: 14,
    marginLeft: 20,
    color: 'black',
    fontWeight: 'bold'
  },
  emptyUserListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  noUserEmptyText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center'
  },
  userListContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  outerBorder: {
    borderColor: 'orange',
    borderWidth: 3,
    padding: 1,
    borderRadius: 40
  },
  outerBorderPurple: {
    borderColor: 'gray',
    borderWidth: 3,
    padding: 1,
    borderRadius: 40
  },
  middleBorder: {
    backgroundColor: 'white',
    borderRadius: 40
  },
  outerBorderInvis: {
    borderColor: 'transparent',
    borderWidth: 3,
    padding: 1,
    borderRadius: 40
  },
});

export default ChatListScreen;
