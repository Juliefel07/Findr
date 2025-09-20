import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/home/Profile');
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
     <LinearGradient
    colors={['#c2cad7ff', '#9fa9b7ff', '#30568bff', '#012c72ff', '#0a2166ff', '#00090bff']}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
        >
        <StatusBar style="light" backgroundColor="transparent" translucent />

        <Text style={styles.pageTitle}>Findr</Text>

        <View style={styles.card}>
          <Text style={styles.header}>Create an Account</Text>
        

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp}>
            <Text style={styles.btnText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={{ color: '#fff', fontSize: 15 }}>
  Already have an account?{' '}
  <Text
    style={{ fontWeight: 'bold', fontSize: 18, color: '#03132eff' }}
    onPress={() => router.replace('/auth/SignIn')}
  >
    Sign In
  </Text>
</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 65,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 0,
    fontFamily: 'Cursive'
  },
  card: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 10,
    width: '65%',
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000ff',
    fontFamily: 'Cursive'
  },
  subHeader: {
    fontSize: 25,
    marginBottom: 20,
    color: 'black',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'white',
    color: '#333',
  },
  signupBtn: {
    backgroundColor: '#07054aff',
    paddingVertical: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  switchLink: {
    marginTop: 10,
  },
});