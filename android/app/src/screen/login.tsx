import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  Button,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { login } from '../services/authServices';
import { updateUser } from '../services/firestoreServices';
const Login = ({navigation}: {navigation: NavigationProp<any>}) => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      const userType = await login(email, password);

      if(userType === 'Student' || userType === 'Staff'){
        const lastLogin = new Date();
        await updateUser(lastLogin);
        navigation.reset({
            index: 0,
            routes: [{name: 'UserHome'}]
        })
      }else if(userType === 'Maintenance Worker'){
        const lastLogin = new Date();
        await updateUser(lastLogin);
        navigation.reset({
            index: 0,
            routes: [{name: 'WorkerHome'}]
        })
      }else{
        const lastLogin = new Date();
        await updateUser(lastLogin);
        navigation.reset({
            index: 0,
            routes: [{name: 'AdminHome'}]
        })
      }

      Alert.alert('Success', 'Login successful!');
    
    } catch (error) {
      console.error('Login Error: ', error);
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../assets/login.png')} // Replace with your logo path
          style={styles.logo}
        />
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
          <Text style={styles.submitButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.reset({
            index: 0,
            routes: [{name: 'SignUp'}]
        })}>
          <Text style={styles.linkText}>Don't have an account yet? Sign Up</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 5,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#1a2847',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#1a2847',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'column',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
});

export default Login;