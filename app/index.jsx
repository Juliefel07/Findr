// ✅ Must be first to polyfill crypto.getRandomValues (fixes upload crash)
import 'react-native-get-random-values';

import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, useRef } from 'react';
import { auth } from '../firebase/config';

import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function Index() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Create Animated values for floating effect for 8 icons
  const floatAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        router.replace('/home/Profile');
      } else {
        setCheckingAuth(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const createFloatAnimation = (animatedValue, delay = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: -10,
            duration: 3000,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = floatAnims.map((anim, index) =>
      createFloatAnimation(anim, index * 350)
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[
        '#031630ff',
        '#09285fff',
        '#154a9aff',
        '#4375a7ff',
        '#829dc0ff',
        '#fdfdfdff',
      ]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Floating Animated Icons */}
      <Animated.View
        style={[
          styles.floatingIcon,
          { top: 200, left: 50, transform: [{ translateY: floatAnims[0] }] },
        ]}
      >
        <MaterialIcons name="search" size={125} color="#7789abff" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { top: 210, right: 80,  transform: [{ translateY: floatAnims[1] }] },
        ]}
      >
        <MaterialIcons name="location-on" size={55} color="#102750ff" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { bottom: 250, left: 130, transform: [{ translateY: floatAnims[2] }] },
        ]}
      >
        <MaterialIcons name="fingerprint" size={95} color="#0c0856ff" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { bottom: 280, right: 80, transform: [{ translateY: floatAnims[3] }] },
        ]}
      >
        <MaterialIcons name="gps-fixed" size={120} color="#050221ff" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { top: 190, left: 300, transform: [{ translateY: floatAnims[4] }] },
        ]}
      >
        <MaterialIcons name="visibility" size={50} color="#fdfdffff" />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          { bottom: 150, left: 250, transform: [{ translateY: floatAnims[5] }] },
        ]}
      >
        <MaterialIcons name="add-location" size={45} color="#17238aff" />
      </Animated.View>

      

      <Animated.View
        style={[
          styles.floatingIcon,
          { bottom: 95, right: 130, transform: [{ translateY: floatAnims[7] }] },
        ]}
      >
        <MaterialIcons name="find-in-page" size={50} color="#020931ff" />
      </Animated.View>

      {/* Main Content */}

      <Text style={styles.subheader}>Findr</Text>
      <Text style={styles.subtitle}>
        Capture and revisit your travel memories
      </Text>

      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={() => router.push('/auth/SignIn')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#031630ff',
  },
  subheader: {
    fontSize: 65,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Cursive',
  },
  subtitle: {
    fontSize: 18,
    color: '#f0f0f0',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: '#070553ff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Cursive',
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.7,
  },
});
