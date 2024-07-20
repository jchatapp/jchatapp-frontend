import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen'; 
import ChatListScreen from './ChatListScreen'; 
import ChatMessages from './ChatMessages'; 
import MediaViewer from './MediaViewer';
import Carousel from './Carousel';
import StoryViewer from './StoryViewer';
import VideoViewer from './VideoViewer';
import ImageViewer from './ImageViewer';
import NewMessageScreen from './NewMessageScreen';
import ReactionScreen from './ReactionScreen';
import ChatSettings from './ChatSettings';
import EditUserListScreen from './EditUserListScreen'
import TimelineDisplay from './TimelineDisplay'
import StoriesScreen from './StoriesScreen'

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatMessages" component={ChatMessages} options={{ headerShown: false }} />
        <Stack.Screen name="MediaViewer" component={MediaViewer} options={{ headerShown: false }} />
        <Stack.Screen name="Carousel" component={Carousel} options={{ headerShown: false }} />
        <Stack.Screen name="StoryViewer" component={StoryViewer} options={{ headerShown: false }} />
        <Stack.Screen name="ImageViewer" component={ImageViewer} options={{ headerShown: false }} />
        <Stack.Screen name="VideoViewer" component={VideoViewer} options={{ headerShown: false }} />
        <Stack.Screen name="NewMessageScreen" component={NewMessageScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReactionScreen" component={ReactionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatSettings" component={ChatSettings} options={{ headerShown: false }} />
        <Stack.Screen name="EditUserListScreen" component={EditUserListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TimelineDisplay" component={TimelineDisplay} options={{ headerShown: false }} />
        <Stack.Screen name="StoriesScreen" component={StoriesScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
