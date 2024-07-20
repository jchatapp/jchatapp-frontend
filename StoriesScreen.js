import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { Video } from 'expo-av';

const StoriesScreen = ({ route, navigation }) => {
  const { stories } = route.params;
  const storySet = stories[0];
  const [activeIndex, setActiveIndex] = useState(0); 

  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        showsPagination={true}
        autoplay={false}
        dotColor="gray"
        activeDotColor="white"
        paginationStyle={styles.pagination}
        onIndexChanged={(index) => setActiveIndex(index)} 
      >
        {storySet.stories.map((story, index) => (
          <View key={index} style={styles.slide}>
            {story.mediaType === 'image' ? (
              <Image source={{ uri: story.source.uri }} style={styles.media} />
            ) : (
              <Video
                source={{ uri: story.source.uri }}
                style={styles.media}
                resizeMode="cover"
                shouldPlay={index === activeIndex} // Play only the active video
                isLooping
              />
            )}
          </View>
        ))}
      </Swiper>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Image
            source={require('./assets/back_arrow.png')}
            style={styles.closeIcon}
          />
        </TouchableOpacity>
        <Image source={{ uri: storySet.imgUrl }} style={styles.profilePic} />
        <Text style={styles.username}>{storySet.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'transparent',
  },
  closeButton: {
    marginRight: 10,
  },
  closeIcon: {
    width: 25,
    height: 25,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    marginLeft: 10,
    color: '#FFF',
    fontSize: 16,
  },
  pagination: {
    bottom: 10,
  },
});

export default StoriesScreen;
