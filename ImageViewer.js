import React from 'react';
import { Image, StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';

const ImageViewer = ({ route, navigation }) => {
  const { imageUrl } = route.params;
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
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
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    resizeMode: "contain",
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

export default ImageViewer;