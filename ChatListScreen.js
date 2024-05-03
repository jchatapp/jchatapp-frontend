import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';

const ChatListScreen = ({ route, navigation }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const { chatList } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={styles.tabText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'empty' && styles.activeTab]}
          onPress={() => setActiveTab('empty')}
        >
          <Text style={styles.tabText}>Activity</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'messages' ? (
        <FlatList
          data={chatList}
          keyExtractor={(item) => item.thread_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
                const userMessages = chatList.filter(item => item.user_id === item.users[0].user_id);
                navigation.navigate('ChatMessages', { chatList: userMessages });
            }}>
              <View style={styles.chatItem}>
                <Image
                  style={styles.chatImage}
                  source={{ uri: item.users[0].profile_pic_url }}
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.chatTitle, item.read_state === 1 ? styles.boldText : null]}>{item.thread_title}</Text>
                  {item.read_state === 1 ? (
                    <Text style={[styles.chatSnippet, styles.boldText]}>New Messages</Text>
                  ) : (
                    <Text style={styles.chatSnippet}>{item.last_permanent_item.text}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No content available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabsContainer: {
    paddingTop: 40,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'red',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  chatImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: 18,
  },
  chatSnippet: {
    fontSize: 14,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  }
});

export default ChatListScreen;
