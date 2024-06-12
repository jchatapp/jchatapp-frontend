import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import config from './config';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(''); 

    try {
      const response = await axios.post(config.API_URL + '/login', { username, password });
      setIsLoading(false);
      if (response.data.chatList) {
        const userInfo = response.data.userInfo;
        const chatList = response.data.chatList;
        const userList = response.data.userList.usersList;
        navigation.replace('ChatListScreen', { chatList, userInfo, userList });
      } else {
        console.error('Chat list not found in response');
        setErrorMessage('Login failed: Invalid username or password.'); 
      }
    } catch (error) {
      console.error(error)
      setIsLoading(false);
      console.error('Full error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      console.error('Login failed:', errorMessage);
      setErrorMessage(errorMessage); 
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Image source={require('./assets/logo.png')} style={styles.logo}/>
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
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Log in with Instagram</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 275,
    height: 130,
    resizeMode: 'contain',
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
  button: {
    backgroundColor: '#385185', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  }
});

export default LoginScreen;
