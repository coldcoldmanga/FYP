import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore } from '@react-native-firebase/firestore';

const firestore = getFirestore(firebaseApp);

export const addUser = async (userData: any) => {
    try{
        const docID = userData.email.split('@')[0];

        if (userData.userType === 'Maintenance Worker') {
            userData.active_task = 0;
        }

        await setDoc(doc(firestore, 'user', docID), userData);
        
    } catch (error) {
        console.error('Add User Error: ', error);
        throw error;
    }
}

export const updateUser = async (userData: any) => {
    try{
        const docID = userData.email.split('@')[0];
        await updateDoc(doc(firestore, 'user', docID), userData);
    } catch (error) {
        console.error('Update User Error: ', error);
        throw error;
    }
}       

export const getUser = async (email: string) => {
    try{
        const userQuery = query(collection(firestore, 'user'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        return userSnapshot.docs[0].data();
    } catch (error) {
        console.error('Get User Error: ', error);
        throw error;
    }
}
