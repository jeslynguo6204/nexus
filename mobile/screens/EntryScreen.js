import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/AuthStyles';

export default function EntryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.entryContainer}>
      <View style={styles.entryTop}>
        <View style={styles.entryLogoCircle}>
          <Text style={styles.entryLogoText}>6°</Text>
        </View>

        <Text style={styles.entryAppName}>SIXDEGREES</Text>

        <Text style={styles.entryTagline}>
          Connection isn&apos;t far.{'\n'}It&apos;s just six degrees.
        </Text>
      </View>

      <View style={styles.entryBottom}>
        <TouchableOpacity
          style={styles.entryPrimaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.entryPrimaryButtonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.entrySecondaryText}>
            Don&apos;t have an account yet?{' '}
            <Text style={styles.entrySecondaryLink}>Sign up here!</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.entryLegalText}>
          By tapping "Log in" you agree to our Terms.{'\n'}
          Learn how we use your data in our Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}
