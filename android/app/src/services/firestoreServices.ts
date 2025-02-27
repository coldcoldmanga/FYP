import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, getDoc } from '@react-native-firebase/firestore';

const firestore = getFirestore(firebaseApp);

export const addUser = async (fullname:string, email:string, phoneNumber:string, userType:string, createdAt:Date, updatedAt:Date, lastLogin:any, status:string, active_task:number) => {
    try{
        const docID = email.split('@')[0];

        if(userType === 'Maintenance Worker'){
            await setDoc(doc(firestore, 'user', docID), {
                fullname,
                email,
                phoneNumber,
                userType,
                createdAt,
                updatedAt,
                active_task
            });
        }else{

        await setDoc(doc(firestore, 'user', docID), {
            fullname,
            email,
            phoneNumber,
            userType,
            createdAt,
            updatedAt,
            lastLogin,
        });

    } 
}catch (error) {
        console.error('Add User Error: ', error);
        throw error;
    }
};

export const updateUser = async (email:string) => {
    try{
        const docID = email.split('@')[0];
        await updateDoc(doc(firestore, 'user', docID), {lastLogin: new Date()});
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



