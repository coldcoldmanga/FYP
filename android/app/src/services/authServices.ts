import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import { firebaseApp } from '../config/firebase';
import { getUser } from './firestoreServices';

//Initialize Auth
const auth = getAuth(firebaseApp);

export const signUp = async (email:string, password:string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)

      Alert.alert('Welcome Onboard', 'Your account has been created successfully!');
      
    } catch (error) {
      console.error('Sign Up Error: ', error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

export const login = async (email:string, password:string) => {

    try{

        await signInWithEmailAndPassword(auth, email, password);
        const user = await getUser(email);
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
        Alert.alert('Success', 'Logout successful!');
    } catch (error) {
        console.error('Logout Error: ', error);
        throw error;
    }
};

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