import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from '@react-native-firebase/auth';
import { collection, query, where, setDoc, doc, getDocs, updateDoc, getFirestore, getDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { firebaseApp } from '../config/firebase';
import { addUser, updateUser, getUser } from './firestoreServices';

//Initialize Firestore and Auth
const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export const signUp = async (userData: any) => {
    try {
      await createUserWithEmailAndPassword(auth, userData.email, userData.password)
    
      const userSnapshot = await getUser(userData.email);

      if(userSnapshot.docs.length > 0){
        throw new Error('Email already in use');
      }

      

      Alert.alert('Welcome ' + userData.fullname , 'Your account has been created successfully!');
      
    } catch (error) {
      console.error('Sign Up Error: ', error);
      throw error; // Rethrow the error for further handling if needed
    }
  };

export const login = async (email: string, password: string) => {

    try{

        await signInWithEmailAndPassword(auth, email, password);

        const user = await getUser(email);
        return user?.userType;

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
    try{
        await sendPasswordResetEmail(auth, email);
        Alert.alert('Success', 'Password reset email sent!');
    } catch (error) {
        console.error('Forgot Password Error: ', error);
        throw error;
    }
};