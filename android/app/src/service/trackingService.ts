import { getFirestore, collection, addDoc, query, where, getDocs, setDoc, doc, deleteDoc } from '@react-native-firebase/firestore';
import { firebaseApp } from '../config/firebase';
import { Alert } from 'react-native';

const firestore = getFirestore(firebaseApp);


export const addTracking = async (userID: string, reportID:string) => {

    try{

        const userTotalTracking = await getUserTotalTracking(userID);

        if(userTotalTracking < 5){
            const trackRef = collection(firestore, 'user_track');
            await setDoc(doc(trackRef), {
                user_id: userID,
                report_id: reportID,
                created_at: new Date(),
            });
            return true;
        }
        Alert.alert("Exceeded Total Tracking Limit. Please delete some record from the tracking list.")
        return false
        
    }catch(error){
        console.log('Error adding tracking: ', error);
        return false;
    }

}

export const getTracking = async (userID:string, reportID:string) => {

    try{
        const trackRef = collection(firestore, 'user_track');
        const trackQuery = query(trackRef, where('user_id', '==', userID), where('report_id', '==', reportID));
        const trackSnapshot = await getDocs(trackQuery);

        return trackSnapshot.docs.length > 0;
    }catch(error){
        console.error('Error getting tracking: ', error);
        return false;
    }
}

export const getUserTotalTracking = async (userID:string) => {
    try {
        const trackRef = collection(firestore, 'user_track');
        const trackQuery = query(trackRef, where('user_id', '==', userID));
        const trackSnapshot = await getDocs(trackQuery);
        return trackSnapshot.docs.length;
    } catch (error) {
        console.error("Failed to get user total tracking: ", error);
        throw error;
    }
}

export const deleteTracking = async (userID:string, reportID:string) => {

    try {
        const trackRef = collection(firestore, 'user_track');
        const trackQuery = query(trackRef, where('user_id', '==', userID), where('report_id', '==', reportID));
        const trackSnapshot = await getDocs(trackQuery);

        if(trackSnapshot.docs.length > 0){
            await deleteDoc(trackSnapshot.docs[0].ref);
            return true;
        }
        return false;
    } catch (error) {
        
    }
    
}
