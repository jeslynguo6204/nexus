import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import HomeScreenNew from '../features/home/screens/HomeScreenNew';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import InboxScreen from '../features/chat/screens/InboxScreen';
import ChatScreen from '../features/chat/screens/ChatScreen';
import LikesScreen from '../features/likes/screens/LikesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InboxScreenTab" component={InboxScreen} />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen}
        options={{
          animationEnabled: true,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
    </Stack.Navigator>
  );
}

function Placeholder({ name }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{name} (placeholder)</Text>
    </View>
  );
}

const ICON_MAP = {
  Home: "home",
  Likes: "heart",
  Chat: "comments",
  Profile: "user",
};

export default function BottomTabs({ onSignOut }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,                // optional, hides top header
        tabBarShowLabel: true,             // you can set false if you want icon-only
        tabBarActiveTintColor: '#000',     // active icon color
        tabBarInactiveTintColor: '#888',   // inactive icon color

        tabBarIcon: ({ color, size }) => {
          const iconName = ICON_MAP[route.name];
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreenNew} />
      <Tab.Screen name="Likes" component={LikesScreen} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onSignOut={onSignOut} />}
      />
    </Tab.Navigator>
  );
}
