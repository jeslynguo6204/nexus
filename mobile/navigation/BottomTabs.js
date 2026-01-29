import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import HomeScreen from '../features/home/screens/HomeScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import InboxScreen from '../features/chat/screens/InboxScreen';
import ChatScreen from '../features/chat/screens/ChatScreen';
import LikesScreen from '../features/likes/screens/LikesScreen';
import FriendsScreen from '../features/friends/screens/FriendsScreen';

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
  Home: "magnifying-glass",
  Likes: "heart",
  Chat: "paper-plane",
  Friends: "user-group",
  Profile: "address-card",
};

export default function BottomTabs({ onSignOut }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F2F2F7',
          height: 70,
          paddingBottom: 20,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
          letterSpacing: 0.1,
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = ICON_MAP[route.name];
          return <FontAwesome6 name={iconName} size={focused ? 24 : 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Likes" component={LikesScreen} />
      <Tab.Screen name="Chat" component={ChatStack} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen
        name="Profile"
      >
        {(props) => <ProfileScreen {...props} onSignOut={onSignOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
