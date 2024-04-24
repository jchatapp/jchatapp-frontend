import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(null); 

  const handleLogin = () => {
    axios
      .post('http://10.0.2.2:8000/login', { username, password })
      .then((response) => {
        console.log('Logged in:', response.data);
        navigation.navigate('HomeScreen');
      })
      .catch((error) => {
        console.error('Login failed:', error.response?.data?.error);
      });
  };

  const testConnectivity = () => {
    axios
      .get('http://10.0.2.2:8000/health')
      .then(() => {
        console.log('Server is reachable');
        setIsConnected(true); 
      })
      .catch((error) => {
        console.error('Server is not reachable:', error);
        setIsConnected(false); 
      });
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

      <Button title="Test Connection" onPress={testConnectivity} /> 
      
      {isConnected !== null && (
        <Text style={styles.connectionStatus}>
          {isConnected ? 'Connected to server' : 'Not connected to server'}
        </Text>
      )}
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
  connectionStatus: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default LoginScreen;
