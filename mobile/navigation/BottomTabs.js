import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Likes" children={() => <Placeholder name="Likes" />} />
      <Tab.Screen name="Chat" children={() => <Placeholder name="Chat" />} />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onSignOut={onSignOut} />}
      />
    </Tab.Navigator>
  );
}
