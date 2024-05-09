import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';

const MediaViewer = ({ route, navigation }) => {
  const { mediaType, mediaUrl } = route.params;

  return (
    <View style={styles.container}>
      {mediaType === 'image' ? (
        <Image source={{ uri: mediaUrl }} style={styles.media} />
      ) : (
        <Video
          source={{ uri: mediaUrl }}
          style={styles.media}
          resizeMode="contain"
          shouldPlay={true}
          isLooping
          useNativeControls
        />
      )}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Image
            source={require('./assets/back_arrow.png')}
            style={{ width: 20, height: 20 }}
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
  media: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  closeText: {
    color: 'black',
    fontSize: 16,
  },
});

export default MediaViewer;
