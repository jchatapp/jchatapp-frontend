import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

export const renderTextMessage = (item, profilePicUrl, isSender) => (
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
  
export const renderImageMessage = (url, profilePicUrl, isSender, width, height) => {
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

export const renderVideoMessage = (url, profilePicUrl, isSender, width, height) => {
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

export const renderMediaShare = (post, profilePicUrl, isSender, navigation) => {
  const openMediaViewer = () => {
    let mediaType = post.product_type == "clip" ? 'image' : 'video';
    let mediaUrl = post.image_versions2 ? post.image_versions2.candidates[0].url : post.video_versions[0].url;
    if (post.product_type == "clips") {
      mediaType = "video"
      mediaUrl = post.video_versions[0].url
    }
    navigation.navigate('MediaViewer', { mediaType, mediaUrl  });
  };
  
  if (post.carousel_media && post.carousel_media.length) {
      const firstMediaUrl = post.carousel_media[0].image_versions2 ? 
                            post.carousel_media[0].image_versions2.candidates[0].url :
                            post.carousel_media[0].video_versions[0].url;
      const firstMediaCaption = post.caption.text;

      return (
          <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={openMediaViewer}>
                  <Image
                      source={{ uri: firstMediaUrl }}
                      style={{ width: 200, aspectRatio: 1, borderRadius: 10, margin: 5 }}
                  />
              </TouchableOpacity>
              {firstMediaCaption ? 
                  <Text style={styles.captionStyle} numberOfLines={2} ellipsizeMode="tail">
                      {firstMediaCaption}
                  </Text> 
              : null}
          </View>
      );
  } else {
      const mediaUrl = post.image_versions2 ? post.image_versions2.candidates[0].url : post.video_versions[0].url;
      const mediaCaption = post.caption ? post.caption.text : '';

    return (
        <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={openMediaViewer}>
                <Image
                    source={{ uri: mediaUrl }}
                    style={{ width: 200, aspectRatio: 1, borderRadius: 10 }}
                />
            </TouchableOpacity>
            {mediaCaption ? 
                <Text style={styles.captionStyle} numberOfLines={2} ellipsizeMode="tail">
                    {mediaCaption}
                </Text> 
            : null}
        </View>
      );
    }
  };
  
export const renderLinkMessage = (item, profilePicUrl, isSender) => (
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


export const renderClipMessage = (clip, profilePicUrl, isSender) => (
  <View style={styles.videoContainer}>
    <Video
      source={{ uri: clip.video_versions[0].url }}  
      style={styles.video}
      resizeMode="cover"
      shouldPlay
      isLooping
    />
    <View style={styles.overlayText}>
      <Text style={styles.username}>{clip.username}</Text>
    </View>
  </View>
  );


  const styles = StyleSheet.create({
    videoContainer: {
      width: '100%',
      height: 200,  
      borderRadius: 10,
      overflow: 'hidden',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    overlayText: {
      position: 'absolute',
      bottom: 10,
      left: 10,
    },
    username: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
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
      borderRadius: 10,
      padding: 10,
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
    captionStyle: {
      color: 'gray',  
      fontSize: 12, 
      textAlign: 'left',
      maxWidth: 200, 
  },
  });