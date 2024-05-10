import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen'; 
import ChatListScreen from './ChatListScreen'; 
import Chat from './ChatMessages'; 
import MediaViewer from "./MediaViewer"
import Carousel from "./Carousel"
import StoryViewer from "./StoryViewer"

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ChatMessages" component={Chat} options={{ headerShown: false }}/>
        <Stack.Screen name="MediaViewer" component={MediaViewer} options={{ headerShown: false }}/>
        <Stack.Screen name="Carousel" component={Carousel} options={{ headerShown: false }}/>
        <Stack.Screen name="StoryViewer" component={StoryViewer} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;