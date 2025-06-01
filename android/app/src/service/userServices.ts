import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, increment, collectionGroup, getDoc, Timestamp, deleteDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

export const addUser = async (fullname:string, email:string, phoneNumber:string, userType:string, playerID:string|null, createdAt:Date, updatedAt:Date, lastLogin:any, status:string, active_task:number, _superAdmin:boolean = false) => {
    try{
        const docID = email.split('@')[0];

        if(userType === 'Maintenance Worker'){
            await setDoc(doc(firestore, 'user', docID), {
                fullname,
                email,
                phone_number: phoneNumber,
                user_type: userType,
                player_id: playerID,
                created_at: createdAt,
                updated_at: updatedAt,
                active_task,
                status,
                last_login: lastLogin,
                login_attempt_error: 0,
                lockout_until: null,
            });
        }
        else if(userType === 'Admin'){

            await setDoc(doc(firestore, 'user', docID), {
                fullname,
                email,
                phone_number: phoneNumber,
                user_type: userType,
                player_id: playerID,
                created_at: createdAt,
                updated_at: updatedAt,
                last_login: lastLogin,
                status,
                super_admin: _superAdmin,
            })
        }
        else{

        await setDoc(doc(firestore, 'user', docID), {
            fullname,
            email,
            phone_number: phoneNumber,
            user_type: userType,
            player_id: playerID,
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

export const getWorker = async () => {
    try{
        const workerQuery = query(collection(firestore, 'user'), where('user_type', '==', 'Maintenance Worker'), where('active_task', '<', 5));
        const workerSnapshot = await getDocs(workerQuery);
        return workerSnapshot.docs.map((doc) => {
            const data = doc.data();
            // Clean up specialization data if it exists
            if (data.specialize && Array.isArray(data.specialize)) {
                data.specialize = data.specialize.map((spec: string) => spec.trim()).filter(Boolean);
            }
            return {
                id: doc.id,
                ...data,
            };
        });
    } catch (error) {
        console.error('Get Worker Error: ', error);
        throw error;
    }
}

export const getUserPlayerID = async (userID:string) => {
    try{
        const userDoc = await getDoc(doc(firestore, 'user', userID));
        if(userDoc.exists){
            return userDoc.data()?.player_id;
        }else{
            return null;
        }
    }catch(error){
        console.error('Get User Player ID Error: ', error);
        throw error;
    }
}

export const updateWorkerActiveTask = async (workerID: string, status:string) => {
    try{
        const workerRef = doc(firestore, 'user', workerID);
        if(status !== 'Completed'){
            await updateDoc(workerRef, {active_task: increment(1)});
        }else{
            await updateDoc(workerRef, {active_task: increment(-1)});
        }
    }catch(error){
        console.error('Update Worker Error: ', error);
        throw error;
    }
}

export const updateUserToken = async (email:string, token:string|null) => {
    try{
        const userRef = query(collection(firestore, 'user'), where('email', '==', email));
        const userSnapshot = await getDocs(userRef);
        await updateDoc(userSnapshot.docs[0].ref, {player_id: token});
    }catch(error){
        console.error('Update User Token Error: ', error);
        throw error;
    }
}

export const getUserTracking = async (reportID:string) => {
    try {
        let playerID = [];
        const userTrackQuery = query(collection(firestore, 'user_track'), where('report_id', '==', reportID));
        const userTrackSnapshot = await getDocs(userTrackQuery);
        
        for(const user of userTrackSnapshot.docs){
            const userRef = doc(firestore, 'user', user.data().user_id);
            const userSnapshot = await getDoc(userRef);
            playerID.push(userSnapshot.data()?.player_id);
        }
        return playerID.filter((id) => id !== null);

    } catch (error) {
        console.error('Get User Tracking Error: ', error);
        throw error;
    }
}

export const updateLoginError = async (userID: string) => {
    try {
        const userRef = doc(firestore, 'user', userID);
        await updateDoc(userRef, {login_attempt_error: increment(1)});
        
    } catch (error) {
        console.error('Failed to update login error: ', error);
        throw error;
    }

}

export const lockAccount = async (userID: string, lockoutUntil: Timestamp) => {
    try {
        const userRef = doc(firestore, 'user', userID);
        await updateDoc(userRef, {lockout_until: lockoutUntil});
    } catch (error) {
        console.log('Lock Account Error: ', error);
        throw error;
    }
}

export const resetLockout = async (userID: string) => {
    try {
        const userRef = doc(firestore, 'user', userID);
        await updateDoc(userRef, {login_attempt_error: 0, lockout_until: null});
    } catch (error) {
        console.log('Reset Lockout Error: ', error);
        throw error;
    }
}

export const getWorkerBySpecialization = async (specialization: string) => {
    try {
        const workerQuery = query(collection(firestore, 'user'), where('user_type', '==', "Maintenance Worker"), where('specialize', 'array-contains-any', [specialization]));
        const workerSnapshot = await getDocs(workerQuery);
        return workerSnapshot.docs.map((doc) => ({
            worker_id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Get Worker By Specialization Error: ', error);
    }
}

export const updateAdmin = async (adminData: any) => {
    try{
        const adminRef = doc(firestore, 'user', adminData.user_id);
        await updateDoc(adminRef, adminData);
    }catch(error){
        console.error('Update Admin Error: ', error);
        throw error;
    }
}

export const deleteAdmin = async (userID: string) => {
    try {
        const adminRef = doc(firestore, 'user', userID);
        await deleteDoc(adminRef);
    } catch (error) {
        console.error('Delete Admin Error: ', error);
        throw error;

    }

}

export const updateWorker = async (workerData: any) => {
    try {
        const workerRef = doc(firestore, 'user', workerData.user_id);
        await updateDoc(workerRef, workerData);
    } catch (error) {
        console.error('Update Worker Error: ', error);
        throw error;
    }

}


export const deleteWorker = async (userID: string) => {
    try {
        const workerRef = doc(firestore, 'user', userID);
        await deleteDoc(workerRef);
    } catch (error) {
        console.error('Delete Worker Error: ', error);
        throw error;

    }

}
