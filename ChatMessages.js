import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import { Video, Audio } from 'expo-av'; 

const RenderVoiceMessage = ({ src }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const handlePlaySound = async () => {
    if (!sound) {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: src },
        { shouldPlay: true },
        updateScreenForSoundStatus
      );
      setSound(newSound);
    }

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const updateScreenForSoundStatus = (status) => {
    if (status.isLoaded) {
      const currentProgress = status.positionMillis / status.durationMillis;
      setProgress(currentProgress);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <TouchableOpacity onPress={handlePlaySound} style={styles.iconButton}>
        <Image 
          source={isPlaying ? require('./assets/pause.png') : require('./assets/play.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChatMessages = ({ route, navigation }) => {
  const { chatList } = route.params;
  const senderPic = chatList.inviter.profile_pic_url;
  const receiverPic = chatList.users[0].profile_pic_url;
  const receiverName = chatList.users[0].full_name;

  const sortedItems = chatList.items.sort((a, b) => a.timestamp - b.timestamp);

  const renderTextMessage = (item, profilePicUrl, isSender) => (
    <View style={[
      styles.messageBox,
      isSender ? styles.senderMessageBox : styles.receiverMessageBox
    ]}>
      <Text style={[
        styles.messageText,
        isSender ? styles.textWhite : styles.textBlack
      ]}>
        {item.text}
      </Text>
    </View>
  );
  
  const renderImageMessage = (url, profilePicUrl, isSender, width, height) => {
    const maxWidth = 200;
    const scale = width > maxWidth ? maxWidth / width : 1;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
  
    return (
      <Image
        source={{ uri: url }}
        style={{ width: scaledWidth, height: scaledHeight, borderRadius: 10 }}
      />
    );
  };

  const renderVideoMessage = (url, profilePicUrl, isSender, width, height) => {
    const maxWidth = 200; 
    const scale = width > maxWidth ? maxWidth / width : 1; 
    const scaledWidth = width * scale; 
    const scaledHeight = height * scale; 
  
    return (
      <Video
        source={{ uri: url }}
        style={{ width: scaledWidth, height: scaledHeight }} 
        resizeMode="contain"
        shouldPlay={false}
        isLooping
        useNativeControls
      />
    );
  };

  const renderMediaShare = (post, profilePicUrl, isSender) => {
    if (post.carousel_media && post.carousel_media.length) {
      return post.carousel_media.map((media, index) => (
        <TouchableOpacity key={index} onPress={() => showInViewer(media)}>
          <Image
            source={{ uri: media.image_versions2.candidates[0].url }}
            style={{ width: 200, height: 200, borderRadius: 10, margin: 5 }}
          />
        </TouchableOpacity>
      ));
    } else if (post.image_versions2) { 
      const img = post.image_versions2.candidates.reduce((prev, curr) => (prev.height > curr.height) ? prev : curr);
      return (
        <TouchableOpacity onPress={() => showInViewer(post)}>
          <Image
            source={{ uri: img.url }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
          />
        </TouchableOpacity>
      );
    } else if (post.video_versions) { 
      return (
        <TouchableOpacity onPress={() => showInViewer(post)}>
          <Video
            source={{ uri: post.video_versions[0].url }}
            style={{ width: 200, height: 200 }}
            resizeMode="cover"
            shouldPlay={false}
            isLooping
            useNativeControls
          />
        </TouchableOpacity>
      );
    }
  
    return <Text>Unsupported Media Type</Text>;
  };
  
  const renderLinkMessage = (item, profilePicUrl, isSender) => (
    <View style={[
      styles.messageBox,
      isSender ? styles.senderMessageBox : styles.receiverMessageBox
    ]}>
      <Text style={[
        styles.messageText,
        isSender ? styles.textWhite : styles.textBlack
      ]}>
        Check this out: {item.text}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const isSender = item.is_sent_by_viewer;
    const profilePicUrl = isSender ? senderPic : receiverPic;
    let messageContent;
    switch (item.item_type) {
      case 'text':
        messageContent = renderTextMessage(item, profilePicUrl, isSender);
        break;
      case 'media':
        const hasvideo = item.media.video_versions;
        if (hasvideo) {
           const bestVideo = item.media.video_versions[0]
            messageContent = renderVideoMessage(bestVideo.url, profilePicUrl, isSender, bestVideo.width, bestVideo.height);
        } else {
          let bestImg = item.media.image_versions2.candidates.reduce((prev, curr) => (prev.height > curr.height) ? prev : curr);
          messageContent = renderImageMessage(bestImg.url, profilePicUrl, isSender, bestImg.width, bestImg.height);
        }
        break;
        case 'voice_media':
          messageContent = <RenderVoiceMessage src={item.voice_media.media.audio.audio_src} />;
          break;

      default:
        messageContent = <Text style={styles.messageText}>Unsupported message type</Text>;
        break;
    }
  
    return (
      <View style={[
        styles.messageContainer,
        isSender ? styles.senderContainer : styles.receiverContainer
      ]}>
        {!isSender && (
          <Image
            style={styles.profileImage}
            source={{ uri: profilePicUrl }}
          />
        )}
        {messageContent}
        {isSender && (
          <Image
            style={styles.profileImage}
            source={{ uri: profilePicUrl }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require('./assets/back_arrow.png')}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <Image source={{ uri: receiverPic }} style={styles.profileImage} />
        <Text style={styles.receiverName}>{receiverName}</Text>
      </View>
      <View style={styles.separatorLine}></View>
      <FlatList
        data={sortedItems}
        keyExtractor={item => item.item_id.toString()} 
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    paddingTop: 30
  },
  backButton: {
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'center',
    width: 44, 
    height: 44,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 4,
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
    marginLeft: 5,
    marginRight: 5,
  },
  separatorLine: {
    height: 1,           
    backgroundColor: 'gray', 
    width: '100%',     
  },
  messageBox: {
    borderRadius: 5,
    padding: 8,
    maxWidth: '70%',
  },
  senderMessageBox: {
    backgroundColor: 'skyblue',
  },
  receiverMessageBox: {
    backgroundColor: 'gray',
    borderWidth: 1,
    borderColor: 'lightgray',
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
  progressBarContainer: {
    height: 7,
    width: 10,
    flex: 1,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    paddingLeft: 5,
    backgroundColor: 'lightblue',
    borderRadius: 10,
  },
  iconButton: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  }
});


export default ChatMessages;
