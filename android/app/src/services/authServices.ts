import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import { firebaseApp } from '../config/firebase';
import { getUser } from './firestoreServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
//Initialize Auth
const auth = getAuth(firebaseApp);

const LOGGED_IN = 'isLoggedIn';
const USER_TYPE = 'userType';
const USER_EMAIL = 'userEmail';

export const isSessionExpired = async () => {
  const email = await AsyncStorage.getItem(USER_EMAIL);
  const user = await getUser(email??'');

  if(!user) return true;

  const lastLogin = user.lastLogin.toDate();
  if(!lastLogin) return true;

  const currentTime = new Date().getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const isExpired = (currentTime - lastLogin.getTime()) > oneWeek;
  return isExpired;
}

export const signUp = async (email:string, password:string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      
    } catch (error) {
      console.error('Sign Up Error: ', error);
      throw error; 
    }
  };

export const login = async (email:string, password:string) => {

    try{

        await signInWithEmailAndPassword(auth, email, password);
        const user = await getUser(email);

        await AsyncStorage.setItem(LOGGED_IN, 'true');
        await AsyncStorage.setItem(USER_TYPE, user.userType);
        await AsyncStorage.setItem(USER_EMAIL, email);

        console.log(await AsyncStorage.getItem(USER_EMAIL));
        console.log(await AsyncStorage.getItem(USER_TYPE));
        console.log(await AsyncStorage.getItem(LOGGED_IN));

        return user;

    } catch (error) {
        Alert.alert('Error', (error as Error).message);
        console.error('Login Error: ', error);
        throw error;
    }
};

export const logout = async () => {
    try{
        await signOut(auth);
        await AsyncStorage.removeItem(LOGGED_IN);
        await AsyncStorage.removeItem(USER_TYPE);
        await AsyncStorage.removeItem(USER_EMAIL);
        Alert.alert('Success', 'Logout successful!');
    } catch (error) {
        console.error('Logout Error: ', error);
        throw error;
    }
};

const resetPassword = async (email:string) => {
    
}

export const forgotPassword = async (email: string) => {
    sendPasswordResetEmail(auth, email)
  .then(() => {
    Alert.alert('Success', 'Password reset email sent!');
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    Alert.alert('Error', errorMessage);
  });
};

export const isLoggedIn = async () => {
  const isLoggedIn = await AsyncStorage.getItem(LOGGED_IN);
  return isLoggedIn === 'true';
}

