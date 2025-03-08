import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy, deleteDoc, addDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addFeedback = async (report_id: string, feedback: any) => {
    try{
        const feedbackRef = collection(firestore, 'reports', report_id, 'feedback')
        await addDoc(feedbackRef, feedback)
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const getFeedback = async (report_id: string) => {
    try{
        const feedbackRef = collection(firestore, 'reports', report_id, 'feedback')
        const snapshot = await getDocs(feedbackRef)
        const feedbackData = snapshot.docs.map((doc) => ({
            feedback_id: doc.id,
            ...doc.data(),
        }))
        return feedbackData;       
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const updateFeedback = async (report_id: string, feedback_id: string, updateData: any) => {
    try{
        const feedbackRef = doc(firestore, 'reports', report_id, 'feedback', feedback_id)
        await updateDoc(feedbackRef, updateData)
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}