import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addUser = async (fullname:string, email:string, phoneNumber:string, userType:string, createdAt:Date, updatedAt:Date, lastLogin:any, status:string, active_task:number) => {
    try{
        const docID = email.split('@')[0];

        if(userType === 'Maintenance Worker'){
            await setDoc(doc(firestore, 'user', docID), {
                fullname,
                email,
                phone_number: phoneNumber,
                user_type: userType,
                created_at: createdAt,
                updated_at: updatedAt,
                active_task,
                status,
                last_login: lastLogin,
            });
        }else{

        await setDoc(doc(firestore, 'user', docID), {
            fullname,
            email,
            phone_number: phoneNumber,
            user_type: userType,
            created_at: createdAt,
            updated_at: updatedAt,
            last_login: lastLogin,
            status,
        });

    } 
}catch (error) {
        console.error('Add User Error: ', error);
        throw error;
    }
};

export const updateUser = async(image:any, fullname:string, email:string, phoneNumber:string) => {
    try{
        const userID = email.split('@')[0];

        const userRef = doc(firestore, 'user', userID);

        const userData = {
            fullname,
            phone_number: phoneNumber,
            updated_at: new Date(),
            profile_picture: null,
        }
        if(image !== null){
            userData.profile_picture = image;
        }

        await updateDoc(userRef, userData);
        
    } catch (error) {
        Alert.alert('Error', (error as Error).message);
        throw error;
    }
}

export const updateLastLogin = async (email:string) => {
    try{
        const docID = email.split('@')[0];
        await updateDoc(doc(firestore, 'user', docID), {last_login: new Date()});
    } catch (error) {
        console.error('Update User Error: ', error);
        throw error;
    }
};       

export const getUser = async (email: string) => {
    try{
        const userQuery = query(collection(firestore, 'user'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        return userSnapshot.docs[0].data();
    } catch (error) {
        console.error('Get User Error: ', error);
        throw error;
    }
};