import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
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
  renderActionLog
} from './Renderer'; 

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

useEffect(() => {
  const profiles = {};
  chatList.users.forEach(user => {
    profiles[user.strong_id__] = user.profile_pic_url;
  });
  setUserProfiles(profiles);
}, [chatList.users]);

  useEffect(() => {
    setMessages(chatList.items.sort((a, b) => b.timestamp - a.timestamp));
  }, [chatList.items]);

  const fetchNewMessages = async () => {
    if (loadingNewMessages) return;
    setLoadingNewMessages(true);
    try {
      const response = await axios.get(config.API_URL + `/chats/${chatList.thread_id}/new_messages`, {
        params: { last_timestamp: lastTimestamp }
      });
      if (response.data && response.data.messages.length > 0) {
        setMessages(currentMessages => {
          const newUniqueMessages = response.data.messages.filter(msg => 
            !messageIds.has(msg.item_id) && !msg.is_sent_by_viewer 
          );
  
          newUniqueMessages.forEach(msg => messageIds.add(msg.item_id));
  
          const updatedMessages = [...newUniqueMessages, ...currentMessages];
          setLastTimestamp(updatedMessages[0].timestamp); 
          return updatedMessages;
        });
      }
      await markAsSeen(chatList.thread_id, chatList.items[0].item_id);
    } catch (error) {
      console.error('Failed to fetch new messages:', error);
      await new Promise(resolve => setTimeout(resolve, 30000)); 
    }
    setLoadingNewMessages(false);
  };
  
  
  useEffect(() => {
    const interval = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    const intervalId = setInterval(fetchNewMessages, interval); 
    return () => clearInterval(intervalId); 
  }, [fetchNewMessages]);
  
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
  
      setInputText('');
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

  const renderItem = ({ item, index }) => {
    const isSender = item.is_sent_by_viewer; 
    const profilePicUrl = isSender ? senderPic : (userProfiles[item.user_id] || "default_profile_pic_url");
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isFirstFromSender = !prevMessage || prevMessage.is_sent_by_viewer !== isSender;

    let messageContent;
    switch (item.item_type) {
      case 'text':
        messageContent = renderTextMessage(item, profilePicUrl, isSender);
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
          messageContent = <View style={styles.expiredStoryContainer}>
                  <Text style={styles.expiredStoryTitle}>{item.story_share.title}</Text>
                  <Text style={styles.expiredStoryMessage}>{item.story_share.message}</Text>
                </View>
        }
        else {
          messageContent = renderStoryShare(item.story_share, profilePicUrl, isSender, navigation)
        }
        break;

      case 'animated_media':
        messageContent = renderAnimatedMedia(item.animated_media.images.fixed_height.url)
        break;
      
      case 'raven_media':
        messageContent = renderRavenMedia(item, isSender, navigation)
        break;

      case 'action_log':
        messageContent = renderActionLog(item.action_log.description)
        break
        
      default:
        messageContent = <Text style={styles.messageText}>Unsupported message type</Text>;
        break;
    }
      
    return (
      <View style={[
        styles.messageContainer,
        isSender ? styles.senderContainer : styles.receiverContainer
      ]}>
        {!isSender && item.item_type !== 'action_log' && (
          <View style={styles.profileImagePlaceholder}>
            {isFirstFromSender && (
              <Image
                style={styles.profileImage}
                source={{ uri: profilePicUrl }}
              />
            )}
          </View>
        )}
        {messageContent}
      </View>
    );
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
          {chatList.is_group ? (
            <GroupProfilePics chatList={chatList} />
            ) : (
                <Image source={{ uri: receiverPic }} 
                    style={{ width: 40, height: 40, borderRadius: 20, marginHorizontal: 10, marginVertical: 4}}
                />
            )}
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
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>SEND</Text>
          </TouchableOpacity>
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
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    marginRight: 5, 
    backgroundColor: 'transparent', 
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
  }
});


export default ChatMessages;
