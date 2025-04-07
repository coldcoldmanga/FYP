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
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { login } from '../service/authServices';
import { updateLastLogin, updateUserToken, updateLoginError, getUser, lockAccount, resetLockout } from '../service/userServices';
import { Timestamp } from '@react-native-firebase/firestore';
const Login = ({navigation}: {navigation: NavigationProp<any>}) => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    else if(!RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email)){
        Alert.alert('Error', 'Please enter a valid email address.');
        return;
    }
    try {
      const userIsLocked = await getUser(email);
      if(userIsLocked.login_attempt_error >= 3){
        await lockAccount(email.split("@")[0], Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 15)));
        Alert.alert('Error', 'Your account is suspended for 15 minutes due to multiple failed login attempts. Please try again later.');
        return;
      }
      if(userIsLocked.lockout_until && userIsLocked.lockout_until.toDate() > new Date()){
        Alert.alert('Error', 'Your account is locked for 15 minutes due to multiple failed login attempts. Please try again later.');
        return;
      }
      

      const user = await login(email, password);
      if(user){
        await updateLastLogin(email); //update user lastLogin
        await updateUserToken(email, user.player_id)
        await resetLockout(email.split("@")[0]);
      if(user.user_type === 'Student' || user.user_type === 'Staff'){
       
        navigation.reset({
            index: 0,
            routes: [{name: 'UserHome'}]
        })
      }else if(user.user_type === 'Maintenance Worker'){
        navigation.reset({
            index: 0,
            routes: [{name: 'WorkerHome'}]
        })
      }else{
        navigation.reset({
            index: 0,
            routes: [{name: 'AdminHome'}]
        })
      }
    }else{
      await updateLoginError(email.split("@")[0]);
    }

    } catch (error) {
      console.error('Login Error: ', error);
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../asset/login.png')}
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