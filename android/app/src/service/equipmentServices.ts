import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy, deleteDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addEquipment = async (equipment: any) => {

    try{
        const equipmentRef = doc(collection(firestore, 'equipment'));
        await setDoc(equipmentRef, equipment);
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

export const deleteEquipment = async (equipmentID: string) => {

    try{
        const equipmentRef = doc(firestore, 'equipment', equipmentID);
        await deleteDoc(equipmentRef);
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