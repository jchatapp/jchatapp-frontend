import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const StoryViewer = ({ route, navigation }) => {
    const { story } = route.params;
    return (
        <View style={styles.fullScreenContainer}>
            <Image source={{ uri: story.media.image_versions2.candidates[0].url }} style={styles.fullScreenImage} />
            <View style={styles.infoContainer}>
                <Image source={{ uri: story.media.user.profile_pic_url }} style={styles.fullScreenProfilePic} />
                <Text style={styles.fullScreenUsername}>{story.media.user.username}</Text>
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
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    fullScreenImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        position: 'absolute',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 40,
        left: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fullScreenProfilePic: {
        width: 45,
        height: 45,
        borderRadius: 25,
    },
    fullScreenUsername: {
        marginLeft: 10,
        fontSize: 18,
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
      }
});

export default StoryViewer;
