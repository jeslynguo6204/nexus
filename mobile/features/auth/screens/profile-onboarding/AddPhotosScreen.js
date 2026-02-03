/**
 * AddPhotosScreen (Section 4.1)
 *
 * Profile onboarding: add profile photos. Requires at least 1 photo.
 * Reached from PlatonicPreferences. On continue navigates to AcademicsScreen.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import styles from '../../../../styles/AuthStyles';

function photosFromParams(params) {
  const uris = params?.photos;
  if (!Array.isArray(uris) || uris.length === 0) return [];
  return uris.map((uri, i) => ({ uri, id: `param-${i}-${uri?.slice(-8) || i}` }));
}

export default function AddPhotosScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const [photos, setPhotos] = useState(() => photosFromParams(routeParams));
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const uris = route.params?.photos;
    if (Array.isArray(uris) && uris.length > 0) setPhotos(photosFromParams(route.params));
  }, [route.params?.photos]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  async function handlePickPhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoading(true);
        const uri = result.assets[0].uri;

        setPhotos([...photos, { uri, id: Date.now() }]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    }
  }

  function handleRemovePhoto(id) {
    setPhotos(photos.filter(p => p.id !== id));
  }

  function handleContinue() {
    if (photos.length === 0) return;

    navigation.navigate('AcademicsScreen', {
      ...routeParams,
      photos: photos.map((p) => p.uri),
    });
  }

  function handleSkip() {
    navigation.navigate('AcademicsScreen', { ...routeParams });
  }

  function handleBack() {
    navigation.navigate('PlatonicPreferences', {
      ...routeParams,
      photos: photos.map((p) => p.uri),
    });
  }

  return (
    <LinearGradient
      colors={['#1F6299', '#34A4FF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.entryContainer} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          onPress={handleBack}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          style={{ position: 'absolute', right: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>Skip →</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <Text style={styles.entryTagline}>Add a photo</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 8 }}>
                Profiles with photos get way more love.
              </Text>
              <Text style={{ fontSize: 13, color: '#C5D0DC', textAlign: 'center', marginBottom: 32 }}>
                Clear, recent photos work best. No pressure — just be you.
              </Text>

              {/* Photo grid - 3:4 ratio, larger photos */}
              <View style={{ marginBottom: 32, alignItems: 'center' }}>
                <View style={{ width: '100%', maxWidth: 280 }}>
                  {photos.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                        {photos.map(photo => (
                          <View key={photo.id} style={{ position: 'relative' }}>
                            <Image
                              source={{ uri: photo.uri }}
                              style={{
                                width: 120,
                                height: 160,
                                borderRadius: 16,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                              }}
                            />
                            <TouchableOpacity
                              onPress={() => handleRemovePhoto(photo.id)}
                              style={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                backgroundColor: '#FF3B30',
                                borderRadius: 999,
                                width: 32,
                                height: 32,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 5,
                              }}
                            >
                              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>×</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Add photo slots (up to 6 total) */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {[...Array(Math.max(1, 6 - photos.length))].map((_, idx) => (
                      <TouchableOpacity
                        key={`empty-${idx}`}
                        onPress={handlePickPhoto}
                        disabled={loading}
                        style={{
                          width: 120,
                          height: 160,
                          borderRadius: 16,
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.4)',
                          borderStyle: 'dashed',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {loading ? (
                          <ActivityIndicator color="#E5F2FF" />
                        ) : (
                          <Text style={{ color: '#E5F2FF', fontSize: 12, textAlign: 'center', fontWeight: '600', paddingHorizontal: 8 }}>
                            Tap to add
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={[
                    styles.entryPrimaryButton,
                    photos.length === 0 && { opacity: 0.5 },
                  ]}
                  onPress={handleContinue}
                  disabled={photos.length === 0}
                  activeOpacity={0.9}
                >
                  <Text style={styles.entryPrimaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
