import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy, deleteDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addFacility = async (facility: any) => {

    try{
        const facilityRef = doc(collection(firestore, 'facility'), facility.facility_id);
        await setDoc(facilityRef, facility);
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const updateFacility = async (facilityID: string, updateData: any) => {

    try{
        const facilityRef = doc(firestore, 'facility', facilityID);
        await updateDoc(facilityRef, updateData); 
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const deleteFacility = async (facilityID: string) => {

    try{
        const facilityRef = doc(firestore, 'facility', facilityID);
        await deleteDoc(facilityRef);   
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const getFacility = async () => {

    try{
        const facilityRef = collection(firestore, 'facility');
        const snapshot = await getDocs(facilityRef);
        const facilityData = snapshot.docs.map((doc) => ({
            facility_id: doc.id,
            ...doc.data(),
        }));
        return facilityData;
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}