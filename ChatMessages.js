import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ChatMessages = ({ route, navigation }) => {
  const { chatList } = route.params;
  console.log(chatList); // This will help to debug and ensure data is being passed correctly.

  const renderItem = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.is_sent_by_viewer ? styles.rightAlign : styles.leftAlign
    ]}>
      <View style={[
        styles.messageBox,
        item.is_sent_by_viewer ? styles.blueBox : styles.whiteBox
      ]}>
        <Text style={[
          styles.messageText,
          item.is_sent_by_viewer ? styles.textWhite : styles.textBlack
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <FlatList
        data={chatList}
        keyExtractor={item => item.messaging_thread_key.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 40,
    margin: 10,
    backgroundColor: 'lightgrey',
    width: 80,
    alignItems: 'center',
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: 'black',
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 4, // Added vertical margin for better spacing
  },
  rightAlign: {
    justifyContent: 'flex-end',
  },
  leftAlign: {
    justifyContent: 'flex-start',
  },
  messageBox: {
    borderRadius: 5,
    padding: 8,
    maxWidth: '80%',
    backgroundColor: 'lightblue', // Default color to distinguish this
  },
  blueBox: {
    backgroundColor: 'blue',
  },
  whiteBox: {
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
