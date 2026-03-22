import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, DeviceEventEmitter, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { isLaunchA } from '../config/launchPhase';
import { getUnreadConversationsCount } from '../api/messagesAPI';
import { getIdToken } from '../auth/tokens';
import Constants from 'expo-constants';
import io from 'socket.io-client';
import HomeScreen from '../features/home/screens/HomeScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import InboxScreen from '../features/chat/screens/InboxScreen';
import ChatScreen from '../features/chat/screens/ChatScreen';
import LikesScreen from '../features/likes/screens/LikesScreen';
import LikesSwipeScreen from '../features/likes/screens/LikesSwipeScreen';
import FriendsScreen from '../features/friends/screens/FriendsScreen';
import ComingSoonScreen from '../features/launch-specific/ComingSoonScreen';

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
};

// Custom tab icon with badge support
function TabIconWithBadge({ name, color, size, focused, badgeCount }) {
  return (
    <View style={styles.iconContainer}>
      <FontAwesome6 name={name} size={focused ? 24 : 22} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function BottomTabs({ onSignOut }) {
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  const API_BASE = useMemo(() => {
    return Constants?.expoConfig?.extra?.apiBaseUrl || 'https://sixdegrees.dev';
  }, []);

  // Fetch the real unread count from the API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await getUnreadConversationsCount();
      if (result?.totalCount != null) {
        setUnreadCount(result.totalCount);
      }
    } catch (e) {
      // Silently fail — badge just won't update
    }
  }, []);

  // Fetch on mount, and when app comes to foreground
  useEffect(() => {
    fetchUnreadCount();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchUnreadCount();
    });
    return () => sub.remove();
  }, [fetchUnreadCount]);

  // Connect a socket so we get notified of new messages even if Chat tab isn't visited
  useEffect(() => {
    let isMounted = true;
    const connect = async () => {
      try {
        const token = await getIdToken();
        if (!token || !isMounted) return;
        const socket = io(API_BASE, {
          transports: ['websocket'],
          auth: { token },
        });
        socketRef.current = socket;

        // When a new message is sent to us, re-fetch the unread count
        socket.on('new_message_notification', () => {
          if (isMounted) fetchUnreadCount();
        });
        // When messages are read, re-fetch count
        socket.on('messages_read', () => {
          if (isMounted) fetchUnreadCount();
        });
      } catch (e) {
        // Silently fail
      }
    };
    connect();
    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, [API_BASE, fetchUnreadCount]);

  useEffect(() => {
    // Listen for direct count updates from InboxScreen (on load)
    const sub1 = DeviceEventEmitter.addListener('unreadCountChanged', (count) => {
      setUnreadCount(count);
    });

    const sub2 = DeviceEventEmitter.addListener('incrementUnreadCount', () => {
      setUnreadCount((prev) => prev + 1);
    });

    const sub3 = DeviceEventEmitter.addListener('refreshUnreadCount', () => {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    return () => {
      sub1.remove();
      sub2.remove();
      sub3.remove();
    };
  }, []);

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
          // Show badge only on Chat tab
          if (route.name === 'Chat') {
            return (
              <TabIconWithBadge
                name={iconName}
                color={color}
                size={size}
                focused={focused}
                badgeCount={unreadCount}
              />
            );
          }
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
          <Tab.Screen name="Profile">
            {(props) => <ProfileScreen {...props} onSignOut={onSignOut} />}
          </Tab.Screen>
        </>
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#1F6299',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
  },
});