import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './LoginScreen';
import ChatListScreen from './ChatListScreen'; 

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} /> 
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;