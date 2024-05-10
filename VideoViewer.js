import React, { useState, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image } from 'react-native';
import { Video } from 'expo-av';

const VideoViewer = ({ route, navigation }) => {
  const { videoUrl } = route.params;
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying); 
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fullScreenTouchable} onPress={togglePlayPause}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.fullScreenVideo}
          resizeMode="contain"
          shouldPlay={true}
          isLooping
          useNativeControls={false}
        />
      </TouchableOpacity>
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
  fullScreenTouchable: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
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

export default VideoViewer;
