import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Chat = ({ route, navigation }) => {
  const { chatId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Chat ID: {chatId}</Text>
      <Text>This is an example chat page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignSelf: 'stretch',
    marginTop: 20,
    marginLeft: 10,
    height: 40, 
  },
  backButton: {
    width: 60, 
  },
  backButtonText: {
    paddingTop: 15,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});

export default Chat;