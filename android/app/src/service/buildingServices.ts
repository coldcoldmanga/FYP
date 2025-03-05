import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy, deleteDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addBuilding = async (building:any) => {

    try{
        const buildinigRef = doc(collection(firestore, 'building'));
        await setDoc(buildinigRef, building);
    }catch(error){
        Alert.alert('Error', (error as Error).message) 
        throw error;
    }
}

export const addFacility = async (facility: any) => {

    try{
        const facilityRef = doc(collection(firestore, 'facility'));
        await setDoc(facilityRef, facility);
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const addEquipment = async (equipment: any) => {

    try{
        const equipmentRef = doc(collection(firestore, 'equipment'));
        await setDoc(equipmentRef, equipment);
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const updateBuilding = async (buildingID: string, updateData: any) => {

    try{
        const buildingRef = doc(firestore, 'building', buildingID);
        await updateDoc(buildingRef, updateData); 
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

export const updateEquipment = async (equipmentID: string, updateData: any) => {

    try{
        const equipmentRef = doc(firestore, 'equipment', equipmentID);
        await updateDoc(equipmentRef, updateData);
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const deleteBuilding = async (buildingID: string) => {

    try{
        const buildingRef = doc(firestore, 'building', buildingID);
        await deleteDoc(buildingRef);
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

export const deleteEquipment = async (equipmentID: string) => {

    try{
        const equipmentRef = doc(firestore, 'equipment', equipmentID);
        await deleteDoc(equipmentRef);
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const getBuilding = async () => {

    try{
        const buildingRef = collection(firestore, 'building');
        const snapshot = await getDocs(buildingRef);
        const buildingData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return buildingData;
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
            id: doc.id,
            ...doc.data(),
        }));
        return facilityData;
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}
   

export const getEquipment = async () => {
    
    try{
        const equipmentRef = collection(firestore, 'equipment');
        const snapshot = await getDocs(equipmentRef);
        const equipmentData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return equipmentData;
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}