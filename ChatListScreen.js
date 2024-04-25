import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ChatListScreen = ({ route }) => {
  const { chatList } = route.params; 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat List</Text>

      <FlatList
        data={chatList}
        keyExtractor={(item) => item.thread_id} 
        renderItem={({ item }) => (
          <View style={styles.chatItem}>
            <Text style={styles.chatTitle}>{item.thread_title}</Text>
            <Text style={styles.chatSnippet}>{item.last_permanent_item.item_content}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  chatItem: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  chatTitle: {
    fontSize: 18,
  },
  chatSnippet: {
    fontSize: 14,
    color: '#555',
  },
});

export default ChatListScreen;