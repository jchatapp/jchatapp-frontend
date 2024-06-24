import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Video } from 'expo-av';

const MediaViewer = ({ route, navigation }) => {
  const { post } = route.params;  
  let caption = (post.caption && post.caption.text) ? post.caption.text : "";
  let mediaType = post.product_type == "clip" ? 'image' : 'video';
  let mediaUrl = post.image_versions2 ? post.image_versions2.candidates[0].url : post.video_versions[0].url;
  if (post.product_type == "clips") {
    mediaType = "video"
    mediaUrl = post.video_versions[0].url
  }

  if (post.product_type == "feed") {
    mediaType = "image"
    mediaUrl = post.image_versions2.candidates[0].url
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fullScreenContainer}>
        {mediaType === 'image' ? (
          <Image source={{ uri: mediaUrl }} style={styles.fullScreenMedia} />
        ) : (
          <Video
            source={{ uri: mediaUrl }}
            style={styles.fullScreenMedia}
            resizeMode="cover"
            shouldPlay={true}
            isLooping
          />
        )}
      </TouchableOpacity>
      <View style={styles.overlayContainer}>
        <View style={styles.userInfoContainer}>
          <Image source={{ uri: post.user.profile_pic_url }} style={styles.profilePic} />
          <Text style={styles.username}>{post.user.username}</Text>
        </View>
        <ScrollView style={styles.captionContainer} contentContainerStyle={styles.captionContent}>
          <Text style={styles.caption}>{caption}</Text>
        </ScrollView>
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
        <Image
          source={require('./assets/back_arrow.png')}
          style={styles.closeIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fullScreenMedia: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  captionContainer: {
    maxHeight: 100,  
    width: '100%',
  },
  captionContent: {
    flexGrow: 1,
  },
  caption: {
    fontSize: 14,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
});

export default MediaViewer;