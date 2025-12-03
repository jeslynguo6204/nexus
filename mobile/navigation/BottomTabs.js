import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function Placeholder({ name }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{name} (placeholder)</Text>
    </View>
  );
}

export default function BottomTabs({ onSignOut }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" children={() => <Placeholder name="Home" />} />
      <Tab.Screen name="Likes" children={() => <Placeholder name="Likes" />} />
      <Tab.Screen name="Chat" children={() => <Placeholder name="Chat" />} />
      <Tab.Screen name="Profile" children={() => <ProfileScreen onSignOut={onSignOut} />} />
    </Tab.Navigator>
  );
}
