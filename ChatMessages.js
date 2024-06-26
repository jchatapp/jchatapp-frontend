import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';
import config from './config';
import {
  renderTextMessage,
  renderImageMessage,
  renderVideoMessage,
  renderMediaShare,
  renderLinkMessage,
  renderStoryShare,
  renderAnimatedMedia,
  renderRavenMedia,
  renderActionLog,
  renderRepliedMessage,
  renderPlaceholder,
  renderLink,
  renderXMAProfile,
  renderXMA,
  renderPoll
} from './Renderer'; 
import {formatTimestamp} from './utils'
import { Ionicons } from '@expo/vector-icons';

const ChatMessages = ({ route, navigation }) => {
  const { chatList } = route.params;
  const senderPic = chatList.inviter.profile_pic_url;
  const receiverPic = chatList.users[0].profile_pic_url;
  const receiverName = chatList.is_group ? chatList.thread_title : (chatList.users[0].full_name || chatList.users[0].short_name);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [loadingNewMessages, setLoadingNewMessages] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [moreAvailable, setMoreAvailable] = useState(true);
  const [messages, setMessages] = useState(chatList.items || []);
  const [lastTimestamp, setLastTimestamp] = useState(messages[messages.length - 1]?.timestamp);
  const [messageIds, setMessageIds] = useState(new Set(chatList.items.map(item => item.item_id)));
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();
  const [userProfiles, setUserProfiles] = useState({});
  const [userMap, setUserMap] = useState({});
  const swipeableRef = useRef(null);


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

  useEffect(() => {
    const profiles = {};
    const userMapTemp = {};
    userMapTemp[chatList.inviter.strong_id__] = chatList.inviter.username;
    chatList.users.forEach(user => {
      profiles[user.pk] = user.profile_pic_url;
      userMapTemp[user.pk] = user.username; 
    });
    setUserProfiles(profiles);
    setUserMap(userMapTemp); 
  }, [chatList.users, chatList.inviter]);

useEffect(() => {
  const profiles = {};
  profiles[chatList.inviter.strong_id__] = chatList.inviter.profile_pic_url;
  chatList.users.forEach(user => {
    profiles[user.strong_id__] = user.profile_pic_url;
  });
  setUserProfiles(profiles);
}, [chatList.users, chatList.inviter]);

  useEffect(() => {
    setMessages(chatList.items.sort((a, b) => b.timestamp - a.timestamp));
  }, [chatList.items]);

  const fetchNewMessagesAndUpdateExisting = async () => {
    if (loadingNewMessages) return;
    setLoadingNewMessages(true);

    try {
        const response = await axios.get(config.API_URL + `/chats/${chatList.thread_id}/new_messages`, {
            params: { last_timestamp: lastTimestamp }
        });

        if (response.data && response.data.messages.length > 0) {
            setMessages(currentMessages => {
                const existingMessageMap = new Map(currentMessages.map(msg => [msg.item_id, msg]));
                const updatesAndNewMessages = response.data.messages;

                updatesAndNewMessages.forEach(message => {
                    const existingMessage = existingMessageMap.get(message.item_id);
                    if (existingMessage) {
                        if (JSON.stringify(existingMessage) !== JSON.stringify(message)) {
                            existingMessageMap.set(message.item_id, {...existingMessage, ...message});
                        }
                    } else {
                        existingMessageMap.set(message.item_id, message);
                    }
                });
                return Array.from(existingMessageMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            });

            setLastTimestamp(response.data.messages[0].timestamp);

            await markAsSeen(chatList.thread_id, response.data.messages[0].item_id);
        }
    } catch (error) {
        console.error('Failed to fetch new messages and updates:', error);
        await new Promise(resolve => setTimeout(resolve, 30000)); 
    }
    setLoadingNewMessages(false);
};

useEffect(() => {
    const interval = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    fetchNewMessagesAndUpdateExisting();
    const intervalId = setInterval(fetchNewMessagesAndUpdateExisting, interval); 
    return () => clearInterval(intervalId);
}, []);
  
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

  const fetchOlderMessages = async (threadId, cursor) => {
    try {
      const response = await axios.get(config.API_URL + `/chats/${threadId}/messages`, {
        params: { cursor }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to load older messages:', error);
    }
  };

  const sendMessage = async () => {
    setInputText('');
    if (inputText.trim()) {
      const tempId = `temp_${Date.now()}`;  
      const newMessage = {
        id: tempId,
        text: inputText,
        is_sent_by_viewer: true,
        timestamp: new Date().getTime(),
        item_type: 'text'
      };
  
    setMessages(currentMessages => [newMessage, ...currentMessages]);
    setMessageIds(prevIds => new Set(prevIds.add(tempId)));
  
    try {
      const response = await axios.post(config.API_URL + `/chats/${chatList.thread_id}/send_message`, {
        message: inputText
      });

      const { messageId } = response.data; 
      setMessages(currentMessages =>
        currentMessages.map(msg => msg.id === tempId ? { ...msg, id: messageId } : msg)
      );
      setMessageIds(prevIds => {
        prevIds.delete(tempId);
        return new Set(prevIds.add(messageId));
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(currentMessages => currentMessages.filter(msg => msg.id !== tempId));
      setMessageIds(prevIds => {
        prevIds.delete(tempId);
        return prevIds;
        });
      }
    }
  };

  const loadOlderMessages = async () => {
    if (loadingOlderMessages || !moreAvailable) return;
    
    setLoadingOlderMessages(true);
    const result = await fetchOlderMessages(chatList.thread_id, cursor);

    if (result.messages === null) {
      setMoreAvailable(false); 
      setLoadingOlderMessages(false);
      return;
    }

    if (result.messages && result.messages.length > 0) {
      const filteredMessages = result.messages.filter(msg => !messageIds.has(msg.item_id));
      const newMessageIds = new Set([...messageIds, ...filteredMessages.map(msg => msg.item_id)]);
      setMessages(prevMessages => [...prevMessages, ...filteredMessages]);
      setMessageIds(newMessageIds);
    }

    setCursor(result.cursor);
    setLoadingOlderMessages(false);
  };

  const renderRightActions = (progress, dragX, item) => {
    const { date, time } = formatTimestamp(item.timestamp);
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
  
    return (
      <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </Animated.View>
    );
  };
  const handleSelectImage = () => {
    console.log("Open image picker");
  };


  const renderItem = ({ item, index }) => {
    const isSender = item.is_sent_by_viewer; 
    const profilePicUrl = isSender ? senderPic : (userProfiles[item.user_id] || "default_profile_pic_url");
    const nextMessage = messages[index - 1]; 
    const prevMessage = messages[index + 1];
    const isLastInGroup = !nextMessage || nextMessage.user_id !== item.user_id || nextMessage.item_type !== item.item_type;
    const isStartOfNewThread = !prevMessage || prevMessage.user_id !== item.user_id || prevMessage.item_type !== item.item_type;

    let messageContent;
    if (item.replied_to_message) {
      const repliedTo = userMap[item.replied_to_message.user_id];
      const replier = userMap[item.user_id]
      const repliedToMessage = item.replied_to_message.text;
      messageContent = renderRepliedMessage(repliedTo, replier, repliedToMessage, item, profilePicUrl, isSender)
    } else {
      switch (item.item_type) {
        case 'text':
          messageContent = renderTextMessage(item, profilePicUrl, isSender, navigation, userMap, userProfiles);
          break;

        case 'media':
          const hasVideo = item.media && item.media.video_versions;
          if (hasVideo) {
            const bestVideo = item.media.video_versions[0];
            messageContent = renderVideoMessage(bestVideo.url, profilePicUrl, isSender, bestVideo.width, bestVideo.height, navigation);
          } else {
            let bestImg = item.media.image_versions2.candidates.reduce((prev, curr) => (prev.height > curr.height) ? prev : curr);
            messageContent = renderImageMessage(bestImg.url, profilePicUrl, isSender, bestImg.width, bestImg.height, navigation);
          }
          break;

        case 'media_share':
          messageContent = renderMediaShare(item.media_share, profilePicUrl, isSender, navigation);
          break;
        
        case 'clip':
          messageContent = renderMediaShare(item.clip.clip, profilePicUrl, isSender, navigation)
          break;
        
        case 'story_share':
          if (item.story_share.is_linked == false) {
            messageContent = (
              <View style={styles.expiredStoryContainer}>
                <Text style={styles.expiredStoryTitle}>{item.story_share.title}</Text>
                <Text style={styles.expiredStoryMessage}>{item.story_share.message}</Text>
              </View>
            );
          } else {
            messageContent = renderStoryShare(item.story_share, profilePicUrl, isSender, navigation);
          }
          break;

        case 'animated_media':
          messageContent = renderAnimatedMedia(item.animated_media.images.fixed_height.url);
          break;
        
        case 'raven_media':
          messageContent = renderRavenMedia(item, isSender, navigation);
          break;

        case 'action_log':
          if (!item.action_log.is_reaction_log) {
            messageContent = renderActionLog(item.action_log.description);
          }
          break;
        
        case 'placeholder':
          messageContent = renderPlaceholder();
          break;
        
        case 'link':
          messageContent = renderLink(item, isSender);
          break;

        case 'xma_profile':
          messageContent = renderXMAProfile(item, isSender)
          break;
        
        case 'xma':
          messageContent = renderXMA(item, isSender)
          break;
        
        case 'direct_group_poll_v1':
          messageContent = renderPoll(item.direct_group_poll_v1[0].action_log.description)
          break
        
        default:
          messageContent = <Text style={styles.unsupportedmessageText}>Unsupported message type</Text>;
          break;
      }
    }
      
    const content = (
      <View>
        {isStartOfNewThread && !isSender && chatList.is_group && item.item_type != "action_log" && item.item_type != 'direct_group_poll_v1' && (
          <View style={styles.userNameHeader}>
            <View style={styles.usernamePlaceHolder}></View>
            <Text style={styles.userNameText}>
              {userMap[item.user_id] || 'Unknown User'}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isSender ? styles.senderContainer : styles.receiverContainer
        ]}>
          {item.item_type !== 'action_log' && item.item_type !== 'direct_group_poll_v1' && (
            <View style={styles.profileImagePlaceholder}>
              {!isSender && isLastInGroup && (
                <Image
                  style={styles.profileImage}
                  source={{ uri: profilePicUrl }}
                />
              )}
            </View>
          )}
          {messageContent}
        </View>
      </View>
    );

    if (item.item_type !== 'action_log' && item.item_type !== 'direct_group_poll_v1') {
      return (
        <Swipeable
          ref={swipeableRef}
          friction={2}
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          rightThreshold={1000}
        >
          {content}
        </Swipeable>
      );
    } else {
      return content;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0} 
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image
              source={require('./assets/back_arrow.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChatSettings', {
              navigation: navigation,
              userMap: userMap,
              userProfiles: userProfiles,
              threadId: chatList.thread_id 
          })}>
            {chatList.is_group ? (
              <GroupProfilePics chatList={chatList} />
              ) : (
                  <Image source={{ uri: receiverPic }} 
                      style={{ width: 40, height: 40, borderRadius: 20, marginHorizontal: 10, marginVertical: 4}}
                  />
              )}
          </TouchableOpacity>
          <Text style={styles.receiverName}>{receiverName}</Text>
        </View>
        <View style={styles.separatorLine}></View>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          inverted 
          ref={flatListRef}
          onEndReached={loadOlderMessages} 
          onEndReachedThreshold={0.1} 
          ListFooterComponent={() => 
            loadingOlderMessages ? 
            <View style={[styles.containerLoad, styles.horizontalLoad]}>
              <ActivityIndicator />
            </View> : null
          }
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor="#888" 
          />
          {inputText ?
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity> :
            <TouchableOpacity style={styles.sendButton} onPress={handleSelectImage}>
              <Ionicons name="image-outline" size={24} color="white" />
            </TouchableOpacity>
          }
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  expiredStoryContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0', 
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'left',
    justifyContent: 'center'
  },
  expiredStoryTitle: {
    fontSize: 16,
    color: '#000', 
    fontWeight: 'bold'
  },
  expiredStoryMessage: {
    fontSize: 14,
    color: '#666',
    maxWidth: 200
  },
  userNameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: 10,
    marginTop: 15
  },
  userNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    marginRight: 5, 
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernamePlaceHolder: {
    width: 40,
    height: 20,
    marginRight: 5, 
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    paddingTop: 57 
  },
  backButton: {
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'center',
    width: 44, 
    height: 44,
  },
  receiverName: {
    fontSize: 18
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 5,
    marginHorizontal: 4,
    alignItems: 'flex-end',
  },
  senderContainer: {
    justifyContent: 'flex-end',
  },
  receiverContainer: {
    justifyContent: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 5
  },
  separatorLine: {
    height: 1,           
    backgroundColor: 'gray', 
    width: '100%',     
  },
  messageText: {
    fontSize: 16,
  },
  textWhite: {
    color: 'white',
  },
  textBlack: {
    color: 'white',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    backgroundColor: 'gray',
    paddingLeft: 20,
  },
  captionStyle: {
    color: 'gray',  
    fontSize: 12, 
    textAlign: 'left',
    maxWidth: 200, 
    marginHorizontal: 10, 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderRadius: 20, 
    fontSize: 14,
  },
  sendButton: {
    padding: 10,
    backgroundColor: 'skyblue', 
    borderRadius: 20, 
  },
  sendButtonText: {
    color: 'white', 
    fontSize: 16,
  },
  containerLoad: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontalLoad: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  profilePicContainer: {
    flexDirection: 'row',
    position: 'relative',
    height: 50, 
    width: 60, 
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 10
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
  rightAction: {
    justifyContent: "center",
    paddingHorizontal: 3,
    backgroundColor: '#f0f0f0',
    minWidth: 100, 
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 10,
    color: 'gray',
    textAlign: 'center',
  }
});


export default ChatMessages;
