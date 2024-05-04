import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ChatMessages = ({ route, navigation }) => {
  const { chatList } = route.params;

  const senderPic = chatList.inviter.profile_pic_url;
  const receiverPic = chatList.users[0].profile_pic_url;
  const receiverName = chatList.users[0].full_name

  const renderItem = ({ item }) => {
    const isSender = item.is_sent_by_viewer;
    const profilePicUrl = isSender ? senderPic : receiverPic;
  
    return (
      <>
      <View style={[
        styles.messageContainer,
        isSender ? styles.senderContainer : styles.receiverContainer
      ]}>
        {!isSender && (
          <Image
            style={styles.profileImage}
            source={{ uri: profilePicUrl }}
          />
        )}
        <View style={[
          styles.messageBox,
          isSender ? styles.senderMessageBox : styles.receiverMessageBox
        ]}>
          <Text style={[
            styles.messageText,
            isSender ? styles.textWhite : styles.textBlack
          ]}>
            {item.text}
          </Text>
        </View>
        {isSender && (
          <Image
            style={styles.profileImage}
            source={{ uri: profilePicUrl }}
          />
        )}
      </View>
      </>
    );
  };
  

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image
          source={require('./assets/back_arrow.png')}
          style={{ width: 20, height: 20 }}
        />
        </TouchableOpacity>
        <Image source={{ uri: receiverPic }} style={styles.profileImage} />
        <Text style={styles.receiverName}>{receiverName}</Text>
      </View>
      <View style={styles.separatorLine}></View>
      <FlatList
        data={chatList.items}
        keyExtractor={item => item.item_id.toString()} 
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    paddingTop: 25
  },
  backButton: {
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'center',
    width: 44, 
    height: 44,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 4,
  },
  senderContainer: {
    justifyContent: 'flex-end',
  },
  receiverContainer: {
    justifyContent: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 5,
  },
  separatorLine: {
    height: 1,           
    backgroundColor: 'gray', 
    width: '100%',     
  },
  messageBox: {
    borderRadius: 5,
    padding: 8,
    maxWidth: '70%',
  },
  senderMessageBox: {
    backgroundColor: 'lightblue',
  },
  receiverMessageBox: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  messageText: {
    fontSize: 16,
  },
  textWhite: {
    color: 'white',
  },
  textBlack: {
    color: 'black',
  }
});


export default ChatMessages;
