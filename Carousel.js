import React from 'react';
import { View, Image, StyleSheet, Text, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import Swiper from 'react-native-swiper';

const Carousel = ({ route, navigation }) => {
  const { post } = route.params;
  const caption = post.caption?.text || "";
  
  return (
    <View style={styles.container}>
      <Swiper style={styles.wrapper} 
            showsButtons={true} 
            loop={false}>
        {post.carousel_media.map((media, index) => (
          media.media_type === 2 ? (
            <Video
              source={{ uri: media.video_versions[0].url }}
              style={styles.fullScreenMedia}
              resizeMode="contain"
              shouldPlay={true}
              isLooping
            />
          ) : (
            <Image
              key={index}
              resizeMode="contain"
              source={{ uri: media.image_versions2.candidates[0].url }}
              style={styles.fullScreenMedia}
            />
          )
        ))}
      </Swiper>
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
  fullScreenMedia: {
    flex: 1
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
  caption: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
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
  }
});

export default Carousel;
