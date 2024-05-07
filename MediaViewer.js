import React, { useState } from 'react';
import { Modal, View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import Swiper from 'react-native-swiper'; 

export const MediaViewer = ({ mediaItems, visible, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.viewerContainer}>
                <Swiper showsButtons={true} loop={false}>
                    {mediaItems.map((media, index) => (
                        <View key={index} style={styles.mediaContent}>
                            {media.type === 'image' ? (
                                <Image
                                    style={styles.fullMedia}
                                    source={{ uri: media.url }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Video
                                    source={{ uri: media.url }}
                                    style={styles.fullMedia}
                                    resizeMode="contain"
                                    shouldPlay
                                    isLooping
                                    useNativeControls
                                />
                            )}
                        </View>
                    ))}
                </Swiper>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    viewerContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullMedia: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
    },
    closeText: {
        fontSize: 16,
        color: '#000',
    },
});
