import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebase/config';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/home/Profile');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
  <LinearGradient
      colors={['#030330ff', '#0e2c56ff', '#295ba2ff', '#5177b5ff', '#a5aecbff', '#f9fafaff']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
          >
      
      <Text style={styles.pageTitle}>Findr</Text>

      
      <View style={styles.card}>
        <Text style={styles.header}>Welcome Back!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleSignIn}>
          <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>

       <Text style={{ color: '#fff', fontsize: 15 }}>
  Don't have an account?{' '}
  <Text
    style={{ fontWeight: 'bold', fontSize: 18, color: '#03132eff'}}
    onPress={() => router.replace('/auth/SignUp')}
  >
    Sign Up
  </Text>
</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '0%',
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
    marginBottom: 35
  },
  header: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 8,
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
    borderColor: '#0b1850ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'transparent',
    borderWidth: 4,

  },
  loginBtn: {
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
