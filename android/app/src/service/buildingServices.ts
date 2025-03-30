import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, collection, getDocs, getFirestore, deleteDoc, getDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addBuilding = async (building:any) => {

    try{
        const buildingID = building.building_id;
        const buildinigRef = doc(collection(firestore, 'building'), buildingID);
        await setDoc(buildinigRef, building);
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

export const deleteBuilding = async (buildingID: string) => {

    try{
        const buildingRef = doc(firestore, 'building', buildingID);
        await deleteDoc(buildingRef);
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
            building_id: doc.id,
            ...doc.data(),
        }));
        return buildingData;
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}

export const getBuildingById = async (buildingId: string) => {
    try{
        const buildingRef = doc(firestore, 'building', buildingId);
        const snapshot = await getDoc(buildingRef);
        return { building_id: snapshot.id, ...snapshot.data() };
    }catch(error){
        Alert.alert('Error', (error as Error).message)
        throw error;
    }
}



   

