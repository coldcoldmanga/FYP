import { firebaseApp } from '../config/firebase';
import { doc, updateDoc, collection, getDocs, getFirestore, addDoc, orderBy, query, where } from '@react-native-firebase/firestore';
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

export const getFeedback = async (fault_type:string) => {
    try{
        //get the report with the fault_type first
        const reportQuery = query(collection(firestore, 'reports'), where('fault_type', '==', fault_type), orderBy('submitted_at', 'desc'))
        const snapshot = await getDocs(reportQuery)
        const result = await Promise.all(
            snapshot.docs.map(async (doc) => {
                //get the feedback for the report
                const reportID = doc.id;
                const feedbackRef = collection(doc.ref, 'feedback')
                const feedbackSnapshot = await getDocs(feedbackRef)
                return feedbackSnapshot.docs.map(feedbackData => ({
                    ...feedbackData.data(),
                    report_id: reportID,
                }))
            })
        )
        return result.flat();       
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