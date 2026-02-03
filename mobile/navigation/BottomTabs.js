import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { isLaunchA } from '../config/launchPhase';
import HomeScreen from '../features/home/screens/HomeScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import InboxScreen from '../features/chat/screens/InboxScreen';
import ChatScreen from '../features/chat/screens/ChatScreen';
import LikesScreen from '../features/likes/screens/LikesScreen';
import LikesSwipeScreen from '../features/likes/screens/LikesSwipeScreen';
import FriendsScreen from '../features/friends/screens/FriendsScreen';
import ComingSoonScreen from '../features/launch-specific/ComingSoonScreen';
import OnboardingTestScreen from '../features/auth/screens/OnboardingTestScreen';

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

function LikesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LikesScreenTab" component={LikesScreen} />
      <Stack.Screen 
        name="LikesSwipe" 
        component={LikesSwipeScreen}
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
  ComingSoon: "hourglass-half",
  OnboardingTest: "vial",
};

export default function BottomTabs({ onSignOut }) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F2F2F7',
          height: 49 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = ICON_MAP[route.name];
          return <FontAwesome6 name={iconName} size={focused ? 24 : 22} color={color} />;
        },
      })}
    >
      {isLaunchA ? (
        <>
          <Tab.Screen 
            name="ComingSoon" 
            component={ComingSoonScreen}
            options={{
              tabBarActiveTintColor: '#FFFFFF',
              tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
              tabBarStyle: {
                position: 'absolute',
                backgroundColor: 'transparent',
                borderTopWidth: 1,
                borderTopColor: 'rgba(242, 242, 247, 0.3)',
                elevation: 0,
                height: 49 + insets.bottom,
                paddingBottom: insets.bottom,
                paddingTop: 0,
              },
            }}
          />
          <Tab.Screen
            name="OnboardingTest"
            component={OnboardingTestScreen}
            options={{
              tabBarLabel: 'Test',
              tabBarShowLabel: true,
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#F2F2F7',
                height: 49 + insets.bottom,
                paddingBottom: insets.bottom,
                paddingTop: 0,
              },
            }}
          />
          <Tab.Screen 
            name="Profile"
            options={{
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#F2F2F7',
                height: 49 + insets.bottom,
                paddingBottom: insets.bottom,
                paddingTop: 0,
              },
            }}
          >
            {(props) => <ProfileScreen {...props} onSignOut={onSignOut} />}
          </Tab.Screen>
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Likes" component={LikesStack} />
          <Tab.Screen name="Chat" component={ChatStack} />
          <Tab.Screen name="Friends" component={FriendsScreen} />
          <Tab.Screen
            name="OnboardingTest"
            component={OnboardingTestScreen}
            options={{ tabBarLabel: 'Test', tabBarShowLabel: true }}
          />
          <Tab.Screen name="Profile">
            {(props) => <ProfileScreen {...props} onSignOut={onSignOut} />}
          </Tab.Screen>
        </>
      )}
    </Tab.Navigator>
  );
}