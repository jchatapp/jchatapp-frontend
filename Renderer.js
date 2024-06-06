import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking  } from 'react-native';
import { Video } from 'expo-av';

export const renderTextMessage = (item, profilePicUrl, isSender, navigation, userMap, profileMap) => {
  const countEmojis = (emojis) => {
    const countMap = {};
    emojis.forEach(emoji => {
      countMap[emoji.emoji] = (countMap[emoji.emoji] || 0) + 1;
    });
    return countMap;
  };

  const handlePressReactions = () => {
    navigation.navigate('ReactionScreen', { reactions: item.reactions, userMap, profileMap });
  };

  const emojiCounts = item.reactions ? countEmojis(item.reactions.emojis) : {};
  const totalReactions = Object.values(emojiCounts).reduce((acc, count) => acc + count, 0);
  const emojiCountArray = Object.keys(emojiCounts).map(emoji => ({
    emoji,
    count: emojiCounts[emoji]
  })).slice(0, 2);

  const additionalMargin = Object.keys(emojiCounts).length > 0 ? 15 : 0;

  return (
    <View style={[
        styles.messageBox,
        isSender ? styles.senderMessageBox : styles.receiverMessageBox,
        { marginBottom: additionalMargin }
    ]}>
        <Text style={[
            styles.messageText,
            isSender ? styles.textWhite : styles.textBlack
        ]}>
            {item.text}
        </Text>
        {Object.keys(emojiCounts).length > 0 && (
            <TouchableOpacity onPress={handlePressReactions} style={[
                styles.reactionsContainer,
                isSender ? styles.senderReactionsContainer : null
            ]}>
                {emojiCountArray.map(({ emoji }, index) => (
                    <Text key={index} style={styles.emoji}>{emoji}</Text>
                ))}
                {totalReactions > 1 && (
                    <Text style={styles.totalReactions}>{totalReactions}</Text>
                )}
            </TouchableOpacity>
        )}
    </View>
  );
};




export const renderImageMessage = (url, profilePicUrl, isSender, width, height, navigation) => {
    const maxWidth = 200;
    const scale = width > maxWidth ? maxWidth / width : 1;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    const openFullScreen = () => {
      navigation.navigate('ImageViewer', { imageUrl: url });
    };

  
    return (
    <TouchableOpacity onPress={openFullScreen}>
      <Image
        source={{ uri: url }}
        style={{ width: scaledWidth, height: scaledHeight, borderRadius: 10 }}
      />
    </TouchableOpacity>
    );
  };

  const handleOpenURL = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      console.error("Don't know how to open URI: " + url);
    }
  };

  export const renderLink = (item, isSender) => {
    const { link_url, link_image_url, link_title } = item.link.link_context;
  
    return (
      <TouchableOpacity onPress={() => handleOpenURL(link_url)} style={[styles.linkContainer, isSender ? styles.senderLink : styles.receiverLink]}>
        <Image source={{ uri: link_image_url }} style={styles.linkImage} />
        <View style={styles.linkTextContainer}>
          <Text style={styles.linkTitle} numberOfLines={1} ellipsizeMode="tail">{link_title}</Text>
          <Text style={styles.linkUrl} numberOfLines={1} ellipsizeMode="tail">{link_url}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  export const renderActionLog = (text) => {
    return (
      <View style={styles.centeredView}>
        <Text style={[
          styles.messageText,
          styles.centeredText
        ]}>
          {text}
        </Text>
      </View>
    )
  }

export const renderVideoMessage = (url, profilePicUrl, isSender, width, height, navigation) => {
  const maxWidth = 200; 
  const scale = width > maxWidth ? maxWidth / width : 1; 
  const scaledWidth = width * scale; 
  const scaledHeight = height * scale; 

  const openFullScreenVideo = () => {
    navigation.navigate('VideoViewer', { videoUrl: url });
  };

  return (
    <TouchableOpacity
    onPress={openFullScreenVideo}
    style={{
      borderRadius: 10,
      overflow: 'hidden', 
      borderColor: 'black',
      borderWidth: 1
    }}
  >
    <Video
      source={{ uri: url }}
      style={{ width: scaledWidth, height: scaledHeight }}
      resizeMode="contain"
      shouldPlay={false}
      useNativeControls={false}
    />
    <Image
        source={require('./assets/play.png')}
        style={styles.playIcon}
      />
  </TouchableOpacity>
  );
};

export const renderMediaShare = (post, profilePicUrl, isSender, navigation) => {
  const openMediaViewer = () => {
    navigation.navigate('MediaViewer', { post });
  };

  const openCarouselViewer = () => {
    navigation.navigate('Carousel', { post });
  }

  const backgroundColor = isSender ? 'skyblue' : 'gray';

  if (post.carousel_media && post.carousel_media.length) {
      const firstMediaUrl = post.carousel_media[0].image_versions2 ? 
                            post.carousel_media[0].image_versions2.candidates[0].url :
                            post.carousel_media[0].video_versions[0].url;
      const firstMediaCaption = post.caption.text;

      return (
          <View style={[styles.postbin, { backgroundColor }]}>
            <View style={styles.userInfoBin}>
            <Image
              source={{ uri: post.user.profile_pic_url }}
              style={{ width: 20, aspectRatio: 1, borderRadius: 10 }}
            />
            <Text style={styles.usernameStyle}>
                      {post.user.username}
                  </Text> 
                  </View>
              <TouchableOpacity onPress={openCarouselViewer}>
                  <Image
                      source={{ uri: firstMediaUrl }}
                      style={{ width: 200, aspectRatio: 1, borderRadius: 10, margin: 5 }}
                  />
              </TouchableOpacity>
              {firstMediaCaption ? 
                  <Text style={styles.captionStyle} numberOfLines={1} ellipsizeMode="tail">
                      {firstMediaCaption}
                  </Text> 
              : null}
          </View>
      );
  } else {
      const mediaUrl = post.image_versions2 ? post.image_versions2.candidates[0].url : post.video_versions[0].url;
      const mediaCaption = post.caption ? post.caption.text : '';

    return (
      <View style={[styles.postbin, { backgroundColor }]}>
      <View style={styles.userInfoBin}>
          <Image
            source={{ uri: post.user.profile_pic_url }}
            style={{ width: 20, aspectRatio: 1, borderRadius: 10 }}
          />
          <Text style={styles.usernameStyle}>
                    {post.user.username}
                </Text> 
                </View>
            <TouchableOpacity onPress={openMediaViewer}>
                <Image
                    source={{ uri: mediaUrl }}
                    style={{ width: 200, aspectRatio: 1, borderRadius: 10, margin: 5 }}
                />
            </TouchableOpacity>
            {mediaCaption ? 
                <Text style={styles.captionStyle} numberOfLines={1} ellipsizeMode="tail">
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

  export const renderStoryShare = (story, profilePicUrl1, isSender, navigation) => {
    let imageUrl = story.media.image_versions2.candidates[0].url;
    let username = story.media.user.username;
    let profilePicUrl = story.media.user.profile_pic_url;

    const openMediaViewer = () => {
      navigation.navigate('StoryViewer', { story });
    };

    return (
        <TouchableOpacity onPress={openMediaViewer} style={styles.storyContainer}>
            <Image source={{ uri: imageUrl }} style={styles.backgroundImage} />
            <View style={styles.storyOverlay}>
                <Image
                    source={{ uri: profilePicUrl }}
                    style={styles.storyprofilePic}
                />
                <Text style={styles.username}>{username}</Text>
            </View>
        </TouchableOpacity>
    );
};

export const renderAnimatedMedia = (url) => (
  <View style={styles.animatedContainer}>
    <Image
      source={{ uri: url }}
      style={{
        width: '100%',   
        height: '100%'
      }}
      resizeMode="contain"
    />
  </View>
);

export const renderRavenMedia = (item, isSender, navigation) => {
  if (item.visual_media.media.image_versions2) {
    const { media } = item.visual_media;
    if (media.media_type === 1) { 
      return (
        <TouchableOpacity 
          onPress={() =>  navigation.navigate('ImageViewer', { imageUrl: item.visual_media.media.image_versions2.candidates[0].url })}
          style={[styles.ravenMediaContainer, { backgroundColor: isSender ? 'blue' : '#666' }]}>
          <Image
            source={require('./assets/play.png')}
            style={styles.ravenPlayIcon}
          />
          <Text style={styles.ravenMediaText}>Photo</Text>
        </TouchableOpacity>
      );
    } else { 
      return (
        <TouchableOpacity 
          onPress={() =>  navigation.navigate('VideoViewer', { videoUrl: item.visual_media.media.video_versions[0].url })}
          style={[styles.ravenMediaContainer, { backgroundColor: isSender ? 'skyblue' : '#666' }]}>
          <Image
            source={require('./assets/play.png')}
            style={styles.ravenPlayIcon}
          />
          <Text style={styles.ravenMediaText}>Video</Text>
        </TouchableOpacity>
      );
    }
  } else {
    return (
      <View style={[styles.ravenMediaContainer, { backgroundColor: 'rgba(102, 102, 102, 0.5)' }]}>
        <Text style={styles.ravenMediaText}>Unavailable</Text>
      </View>
    );
  }
};

export const renderRepliedMessage = (repliedto, replier, message, item, profilePicUrl, isSender) => {
  if (!repliedto) {
    repliedto = "You"
  }
  if (!replier) {
    replier = "You"
  }
  return (
    <View style={styles.repliedMessageContainer}>
      <Text style={styles.repliedToText}>
        {replier} replied to {repliedto}
      </Text>
      <View style={styles.repliedMessageContent}>
        <Text style={styles.repliedMessageText}>
          {message}
        </Text>
      </View>
      <View style={styles.originalMessageContent}>
        {item.item_type === 'text' && renderTextMessage(item, profilePicUrl, isSender)}
      </View>
    </View>
  )
}

export const renderPlaceholder = () => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        Message unavailable
      </Text>
      <Text style={styles.placeholderSubText}>
        This content may have been deleted by its owner or hidden by their privacy settings. You may be able to view it on Instagram.
      </Text>
    </View>
  );
}


export const renderXMAProfile = (item, isSender) => {
  const title = item.xma_profile[0].header_title_text;
  const subheader = item.xma_profile[0].header_subtitle_text;
  const profilePicUrl = item.xma_profile[0].header_icon_url_info.fallback.url;
  const urls = item.xma_profile[0].preview_extra_urls_info?.map(entry => entry.url) || [];
  const targetUrl = item.xma_profile[0].target_url;

  const handlePress = () => {
    Linking.openURL(targetUrl);
  };

  return (
    <TouchableOpacity style={styles.xmaProfileContainer} onPress={handlePress}>
      <View style={styles.xmaProfileHeader}>
        <Image style={styles.xmaProfileImage} source={{ uri: profilePicUrl }} />
        <View style={styles.xmaProfileHeaderTextContainer}>
          <Text style={styles.xmaProfileTitle}>{title}</Text>
          {subheader && <Text style={styles.xmaProfileSubheader}>{subheader}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const renderXMA = (item, isSender) => {
  const title = item.xma.header_title_text;
  const subheader = item.xma.header_subtitle_text;
  const profilePicUrl = item.xma.header_icon_url;
  const targetUrl = item.xma.target_url;

  const handlePress = () => {
    Linking.openURL(targetUrl);
  };

  return (
    <TouchableOpacity style={styles.xmaProfileContainer} onPress={handlePress}>
      <View style={styles.xmaProfileHeader}>
        <Image style={styles.xmaProfileImage} source={{ uri: profilePicUrl }} />
        <View style={styles.xmaProfileHeaderTextContainer}>
          <Text style={styles.xmaProfileTitle}>{title}</Text>
          {subheader && <Text style={styles.xmaProfileSubheader}>{subheader}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  profileImagePlaceholder: {
    width: 50,
    height: 10,
    marginRight: 5
  },
  storyContainer: {
    width: 150,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,  
    borderWidth: 1,
  },
  backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: '#a9a9a9',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: -20, 
    marginRight: -20, 
},
emoji: {
  fontSize: 12, 
  marginHorizontal: 2, 
},
totalReactions: {
  fontSize: 12,
  color: 'white',
  marginHorizontal: 3
},
  storyOverlay: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)'  
  },
  storyprofilePic: {
    width: 20,
    height: 20,
    borderRadius: 15, 
    marginRight: 5,
  },
  userInfoBin: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: "100%",
    padding: 3,
    marginLeft: 7,
    marginTop: 3
  },
  usernameStyle: {
    color: 'white',  
    fontSize: 10, 
    textAlign: 'left',
    margin: 3,
    paddingLeft: 4
},
  videoContainer: {
    width: '100%',
    height: 200,  
    borderRadius: 10,
    overflow: 'hidden',
  },
  postbin: {
    borderRadius: 10,
    alignItems: 'center'
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
    margin: 2,
    color: 'white',
    fontSize: 10,
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
    backgroundColor: '#a9a9a9',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  messageText: {
    fontSize: 16,
  },
  centeredView: {
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%',
    padding: 5 
  },
  centeredText: {
    textAlign: 'center', 
    fontSize: 14,
    color: "gray"
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
    color: 'white', 
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: "100%",
    fontSize: 10, 
    maxWidth: 200, 
    marginBottom: 7
  },
  playIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  animatedContainer: {
    width: 120, 
    height: 120,     
    alignItems: 'flex-start',  
    borderRadius: 10
  },
  ravenMediaContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 10
  },
  playIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  ravenPlayIcon: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  ravenMediaText: {
    fontSize: 14, 
    color: 'white', 
  },
  repliedMessageContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 5,
    maxWidth: '70%'
  },
  repliedToText: {
    fontSize: 12,
    color: '#888',
  },
  repliedMessageContent: {
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 5,
    alignSelf: 'flex-start',
    marginHorizontal: 10
  },
  repliedMessageText: {
    fontSize: 14,
    color: '#333',
  },
  originalMessageContent: {
    marginTop: 5,
    alignSelf: 'flex-start' 
  },
  placeholderContainer: {
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',  
    borderRadius: 5,
    maxWidth: "75%"
  },
  placeholderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333'  
  },
  placeholderSubText: {
    fontSize: 14,
    color: '#666', 
    marginTop: 5
  },
  senderReactionsContainer: {
    backgroundColor: 'skyblue',  
  },
  linkContainer: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    maxWidth: "70%"
  },
  senderLink: {
    backgroundColor: '#e9f5ff',
  },
  receiverLink: {
    backgroundColor: '#f0f0f0', 
  },
  linkImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  linkTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  linkTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    overflow: 'hidden',
  },
  linkUrl: {
    fontSize: 14,
    color: '#555',
    overflow: 'hidden',
  },
  xmaProfileContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#f0f0f0',
    width: 218,
    maxHeight: 50,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 1,
  },
  
  xmaProfileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
  },
  
  xmaProfileImage: {
    margin: 5,
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  
  xmaProfileHeaderTextContainer: {
    flex: 1, 
    height: "100%",
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    paddingLeft: 5
  },
  centeredContent: {
    alignItems: 'flex-start',  
    justifyContent: 'center',   
  },
  xmaProfileTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'flex-start', 
  },
  xmaProfileSubheader: {
    fontSize: 10,
    color: 'gray',
    textAlign: 'flex-start' 
  },
  
  xmaProfileImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  xmaProfileGridImage: {
    width: 70,
    height: 70,
    margin: 1
  }
  });