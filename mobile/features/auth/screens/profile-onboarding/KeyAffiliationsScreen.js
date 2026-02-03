/**
 * KeyAffiliationsScreen (Section 5.2)
 *
 * Profile onboarding: select up to 2 key affiliations to highlight.
 * Reached from AddAffiliationsScreen. On continue navigates to CompleteSignup.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../../../styles/AuthStyles';

function AffiliationChip({ affiliation, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: selected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>
        {affiliation.name}
      </Text>
      {selected && (
        <Text style={{ color: '#E5F2FF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
      )}
    </TouchableOpacity>
  );
}

export default function KeyAffiliationsScreen({ navigation, route }) {
  const [selectedKeyAffiliations, setSelectedKeyAffiliations] = useState([]);
  const [affiliations, setAffiliations] = useState([]);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const routeParams = route.params || {};
  const selectedAffiliationIds = routeParams.selectedAffiliations || [];

  useEffect(() => {
    // Convert selected affiliations to display items
    setAffiliations(
      selectedAffiliationIds.map((id, idx) => ({
        id,
        name: typeof id === 'string' ? id : `Affiliation ${idx + 1}`,
      }))
    );

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function handleToggleAffiliation(id) {
    const isSelected = selectedKeyAffiliations.includes(id);

    if (isSelected) {
      setSelectedKeyAffiliations(selectedKeyAffiliations.filter(aId => aId !== id));
    } else if (selectedKeyAffiliations.length < 2) {
      setSelectedKeyAffiliations([...selectedKeyAffiliations, id]);
    } else {
      Alert.alert('Limit reached', 'You can only select up to 2 key affiliations.');
    }
  }

  function handleContinue() {
    navigation.navigate('CompleteSignup', {
      ...routeParams,
      keyAffiliations: selectedKeyAffiliations,
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
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <Text style={styles.entryTagline}>Key affiliations</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 24 }}>
                Choose up to two to highlight on your profile.
              </Text>

              <Text style={{ fontSize: 13, color: '#C5D0DC', marginBottom: 12 }}>
                These show up front — you can change them anytime.
              </Text>

              {affiliations.length === 0 ? (
                <View style={{ marginTop: 32, alignItems: 'center' }}>
                  <Text style={{ color: '#C5D0DC', fontSize: 14 }}>
                    No affiliations selected. Go back and add some!
                  </Text>
                </View>
              ) : (
                <View style={{ marginBottom: 20, marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {affiliations.map(aff => (
                      <AffiliationChip
                        key={aff.id}
                        affiliation={aff}
                        selected={selectedKeyAffiliations.includes(aff.id)}
                        onPress={() => handleToggleAffiliation(aff.id)}
                      />
                    ))}
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      color: '#C5D0DC',
                      marginTop: 16,
                      fontStyle: 'italic',
                    }}
                  >
                    Selected: {selectedKeyAffiliations.length} / 2
                  </Text>
                </View>
              )}

              <View style={{ alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <TouchableOpacity
                  style={styles.entryPrimaryButton}
                  onPress={handleContinue}
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
