import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const ReactionScreen = ({ route, navigation }) => {
  const { reactions, userMap, profileMap } = route.params;
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require('./assets/back_arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reactions</Text>
      </View>
      {reactions.emojis.map((reaction, index) => (
        <View key={index} style={styles.reactionItem}>
          <Image
            style={styles.profileImage}
            source={{ uri: profileMap[reaction.sender_id] }}
          />
          <Text style={styles.username}>{userMap[reaction.sender_id]}</Text>
          <Text style={styles.emoji}>{reaction.emoji}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingTop: 57,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    position: 'absolute',
    left: 11,
    bottom: 11, 
  },
  backArrow: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  emoji: {
    fontSize: 24,
  },
});

export default ReactionScreen;
