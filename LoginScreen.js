import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return; 
    setIsLoading(true);
  
    try {
      const response = await axios.post('http://10.0.2.2:8000/login', { username, password });
      setIsLoading(false);
      if (response.data.chatList) {
        const chatList = response.data.chatList; 
        navigation.navigate('ChatListScreen', { chatList });
      } else {
        console.error('Chat list not found in response');
      }
    } catch (error) {
      setIsLoading(false); 
  
      console.error('Full error:', error); 
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      console.error('Login failed:', errorMessage); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} /> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '80%',
  },
});

export default LoginScreen;
