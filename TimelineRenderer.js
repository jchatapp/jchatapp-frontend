import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Swiper from 'react-native-swiper';

const RenderItemType1 = ({ item, navigation }) => {
    const imageref = item.image_versions2.candidates[0].url;
    const username = item.user.username;
    const caption = item.caption?.text;
    const timestamp = item.caption?.created_at;

    const [showFullCaption, setShowFullCaption] = useState(false);
    const [isCaptionTruncated, setIsCaptionTruncated] = useState(false);

    const toggleCaption = () => {
        setShowFullCaption(!showFullCaption);
    };

    return (
        <View style={styles.postContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('FullScreenImage', { imageUrl: imageref })}>
                <Image
                    style={styles.image}
                    source={{ uri: imageref }}
                />
                {iconBar(item)}
            </TouchableOpacity>
            <View style={styles.textContainer}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.timestamp}>{moment.unix(timestamp).fromNow()}</Text>
            </View>
            {caption && (
                <TouchableOpacity onPress={toggleCaption}>
                    <Text
                        style={styles.caption}
                        numberOfLines={showFullCaption ? 0 : 2}
                        onTextLayout={(e) => {
                            setIsCaptionTruncated(e.nativeEvent.lines.length > 2);
                        }}
                    >
                        {caption}
                        {!showFullCaption && isCaptionTruncated && (
                            <Text style={styles.moreText}>... more</Text>
                        )}
                    </Text>
                </TouchableOpacity>
            )}
            {showFullCaption && (
                <Text style={styles.lessText} onPress={toggleCaption}>
                    Show less
                </Text>
            )}
        </View>
    );
};

const RenderItemType2 = ({ item, isFocused, navigation }) => {
    const videoRef = useRef(null);
    const username = item.user.username;
    const caption = item.caption?.text;
    const timestamp = item.caption?.created_at;

    const [showFullCaption, setShowFullCaption] = useState(false);
    const [isCaptionTruncated, setIsCaptionTruncated] = useState(false);

    useEffect(() => {
        if (isFocused) {
            videoRef.current?.playAsync();
        } else {
            videoRef.current?.pauseAsync();
        }
    }, [isFocused]);

    const toggleCaption = () => {
        setShowFullCaption(!showFullCaption);
    };

    return (
        <View style={styles.postContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('FullScreenVideo', { videoUrl: item.video_versions[0].url })}>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: item.video_versions[0].url }}
                    useNativeControls={false}
                    resizeMode="cover"
                    isLooping
                    shouldPlay={isFocused}
                />
                {iconBar(item)}
            </TouchableOpacity>
            <View style={styles.textContainer}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.timestamp}>{moment.unix(timestamp).fromNow()}</Text>
            </View>
            {caption && (
                <TouchableOpacity onPress={toggleCaption}>
                    <Text
                        style={styles.caption}
                        numberOfLines={showFullCaption ? 0 : 2}
                        onTextLayout={(e) => {
                            setIsCaptionTruncated(e.nativeEvent.lines.length > 2);
                        }}
                    >
                        {caption}
                        {!showFullCaption && isCaptionTruncated && (
                            <Text style={styles.moreText}>... more</Text>
                        )}
                    </Text>
                </TouchableOpacity>
            )}
            {showFullCaption && (
                <Text style={styles.lessText} onPress={toggleCaption}>
                    Show less
                </Text>
            )}
        </View>
    );
};

const RenderItemType8 = ({ item, isFocused, navigation }) => {
    const videoRefs = useRef([]);

    const [showFullCaption, setShowFullCaption] = useState(false);
    const [isCaptionTruncated, setIsCaptionTruncated] = useState(false);

    useEffect(() => {
        videoRefs.current.forEach((videoRef, index) => {
            if (isFocused) {
                videoRef?.playAsync();
            } else {
                videoRef?.pauseAsync();
            }
        });
    }, [isFocused]);

    const toggleCaption = () => {
        setShowFullCaption(!showFullCaption);
    };

    return (
        <View style={styles.postContainer}>
            <View style={styles.swiperContainer}>
                <Swiper style={styles.wrapper} showsButtons={true} loop={false}>
                    {item.carousel_media.map((media, index) => (
                        media.media_type === 2 ? (
                            <Video
                                key={index}
                                ref={ref => videoRefs.current[index] = ref}
                                source={{ uri: media.video_versions[0].url }}
                                style={styles.media}
                                resizeMode="cover"
                                isLooping
                            />
                        ) : (
                            <Image
                                key={index}
                                resizeMode="cover"
                                source={{ uri: media.image_versions2.candidates[0].url }}
                                style={styles.media}
                            />
                        )
                    ))}
                </Swiper>
            </View>
            {iconBar(item)}
            <View style={styles.textContainer}>
                <Text style={styles.username}>{item.user.username}</Text>
                <Text style={styles.timestamp}>{moment.unix(item.caption?.created_at).fromNow()}</Text>
            </View>
            {item.caption?.text && (
                <TouchableOpacity onPress={toggleCaption}>
                    <Text
                        style={styles.caption}
                        numberOfLines={showFullCaption ? 0 : 2}
                        onTextLayout={(e) => {
                            setIsCaptionTruncated(e.nativeEvent.lines.length > 2);
                        }}
                    >
                        {item.caption.text}
                        {!showFullCaption && isCaptionTruncated && (
                            <Text style={styles.moreText}>... more</Text>
                        )}
                    </Text>
                </TouchableOpacity>
            )}
            {showFullCaption && (
                <Text style={styles.lessText} onPress={toggleCaption}>
                    Show less
                </Text>
            )}
        </View>
    );
};

const iconBar = (item) => {
    const handleLike = () => {
        console.log('Like button clicked');
    };

    const handleComment = () => {
        console.log('Comment button clicked');
    };

    const handleSend = () => {
        console.log('Send button clicked');
    };
    return (
        <View style={styles.iconBar}>
            <TouchableOpacity onPress={handleLike}>
                <Icon name={item.has_liked ? 'heart' : 'heart-outline'} size={28} color={item.has_liked ? 'red' : 'black'} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleComment}>
                <Icon name="chatbubble-outline" size={24} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSend}>
                <Icon name="paper-plane-outline" size={24} style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    postContainer: {
        marginBottom: 20,
    },
    video: {
        width: '100%',
        height: 550, 
    },
    image: {
        width: '100%',
        height: 400,
    },
    media: {
        width: '100%',
        height: 400,
    },
    swiperContainer: {
        width: '100%',
        height: 400,
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 6,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 14,
        color: 'gray',
    },
    caption: {
        fontSize: 14,
        marginHorizontal: 8,
        marginBottom: 4,
    },
    moreText: {
        color: 'blue',
    },
    lessText: {
        color: 'gray',
        fontSize: 12,
        marginHorizontal: 8,
    },
    iconBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 8,
    },
    icon: {
        marginRight: 16,
    },
});

export { RenderItemType1, RenderItemType2, RenderItemType8 };
