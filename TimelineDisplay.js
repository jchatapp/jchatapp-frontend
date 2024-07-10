import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { renderItemType1, RenderItemType2, renderItemType8 } from './TimelineRenderer';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const CaughtUpComponent = ({username}) => {
    return (
        <View style={styles.caughtUpContainer}>
            <View style={styles.lineContainer}>
                <View style={styles.line}></View>
                <Icon name="checkmark" size={24} style={styles.icon} />
                <View style={styles.line}></View>
            </View>
            <Text style={styles.mainText}>You're All Caught Up</Text>
            <Text style={styles.subText}>You've seen all new posts from {username}</Text>
        </View>
    );
};

const TimelineDisplay = ({ route, navigation }) => {
    const userinfo = route.params.item;
    const timeline = route.params.postlist;
    const newPosts = timeline.newPosts;
    const oldPosts = timeline.oldPosts;
    const timelineData = prepareTimelineData(newPosts, oldPosts);
    const isFocused = useIsFocused();
    const [visibleItems, setVisibleItems] = useState([]);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        setVisibleItems(viewableItems.map(item => item.key));
    }, []);

    const renderItem = ({ item }) => {
        if (item.type === 'marker') {
            return <CaughtUpComponent username={userinfo.username}/>;
        } else {
            const isItemFocused = visibleItems.includes(item.organic_tracking_token || item.id);
            switch (item.media_type) {
                case 1:
                    return renderItemType1(item);
                case 2:
                    return <RenderItemType2 item={item} isFocused={isItemFocused && isFocused} navigation={navigation} />;
                case 8:
                    return renderItemType8(item);
                default:
                    return (
                        <View style={styles.postContainer}>
                            <Text>test</Text>
                        </View>
                    );
            }
        }
    };

    function prepareTimelineData(newPosts, oldPosts) {
        const allCaughtUpMarker = { id: 'allCaughtUp', type: 'marker' };
        return [...newPosts, allCaughtUpMarker, ...oldPosts];
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image
                        source={require('./assets/back_arrow.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
                <Image source={{ uri: userinfo.profile_pic_url }} 
                    style={{ width: 40, height: 40, borderRadius: 20, marginHorizontal: 10, marginVertical: 4 }}
                />
                <Text style={styles.receiverName}>{userinfo.username}</Text>
            </View>
            <View style={styles.separatorLine}></View>
            <FlatList
                data={timelineData}
                keyExtractor={(item) => item.organic_tracking_token || item.id}
                renderItem={renderItem}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        paddingTop: 57 
    },
    backButton: {
        padding: 10,
        justifyContent: 'center', 
        alignItems: 'center',
        width: 44, 
        height: 44,
    },
    receiverName: {
        fontSize: 18
    },
    separatorLine: {
        height: 1,           
        backgroundColor: 'gray', 
        width: '100%',     
    },
    caughtUpContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    line: {
        height: 1,
        backgroundColor: '#ccc',
        flex: 1,
    },
    icon: {
        width: 24,
        height: 24,
        marginHorizontal: 10,
    },
    mainText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    subText: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
    postContainer: {
        padding: 10,
    },
});

export default TimelineDisplay;
