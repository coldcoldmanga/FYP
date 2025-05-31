import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, orderBy, getDoc } from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
const firestore = getFirestore(firebaseApp);

//report
export const addReport = async (report: any) => {
    try{
        const reportRef = doc(collection(firestore, 'reports'), report.report_id);
        await setDoc(reportRef, report);
    }catch(error){
        Alert.alert('Error', (error as Error).message);
        throw error;
    }
    
};

export const getReport = async () => {
    try {
        const reportQuery = query(collection(firestore, 'reports'), orderBy('submitted_at', 'desc'));
        const reportSnapshot = await getDocs(reportQuery);
        return reportSnapshot.docs.map((doc) => ({
            report_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Get Report Error: ', error);
        throw error;

    }
}

export const getReportByUser = async () => {
    try{
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userType = await AsyncStorage.getItem('userType');
        let reportQuery;
        
        if(userType === 'Admin'){
            reportQuery = query(
                collection(firestore, 'reports'),
                orderBy('submitted_at', 'desc')
            );
        }
        else if (userType === 'Maintenance Worker') {
            // For maintenance workers, fetch reports assigned to them
            reportQuery = query(
                collection(firestore, 'reports'), 
                where('assigned_to', '==', userEmail?.split('@')[0]),
                orderBy('submitted_at', 'desc')
            );
        } else {
            // For students and staff, fetch reports created by them
            reportQuery = query(
                collection(firestore, 'reports'), 
                where('user_id', '==', userEmail?.split('@')[0]),
                orderBy('submitted_at', 'desc')
            );
        }
        const reportSnapshot = await getDocs(reportQuery);
        

        return reportSnapshot.docs.map((doc) => ({
            report_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Get Report Error: ', error);
        throw error;
    }
};

export const getReportByStatus = async (status: string) => {
    try{
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userType = await AsyncStorage.getItem('userType');
        let reportQuery;

        if(userType === 'Admin'){
            reportQuery = query(
                collection(firestore, 'reports'),
                where('status', '==', status),
                orderBy('submitted_at', 'desc')
            );
        }
        else if(userType === 'Maintenance Worker'){
            reportQuery = query(
                collection(firestore, 'reports'),
                where('status', '==', status),
                where('assigned_to', '==', userEmail?.split('@')[0]),
                orderBy('submitted_at', 'desc')
            );
        }
        else{
            reportQuery = query(
                collection(firestore, 'reports'),
                where('status', '==', status),
                where('user_id', '==', userEmail?.split('@')[0]),
                orderBy('submitted_at', 'desc')
            );
        }
        const reportSnapshot = await getDocs(reportQuery);

        return reportSnapshot.docs.map((doc) => ({
            report_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        Alert.alert('Error', (error as Error).message);
        throw error;
    }
};

export const updateReport = async (reportID: string, updateData: any) => {
    try{
        const reportRef = doc(firestore, 'reports', reportID);
        await updateDoc(reportRef, updateData);
    } catch (error) {
        console.error('Update Report Error: ', error);
        throw error;
    }
};

export const checkIsReporter = async (reportID:string) => {
    try {
        const reportRef = doc(firestore, 'reports', reportID);
        const reportSnapshot = await getDoc(reportRef);
        return reportSnapshot.data()?.user_id;
    } catch (error) {
        console.error('Error checking if user is reporter: ', error);
        throw error;
    }
}

export const assignTaskToWorker = async (reportID: string, workerID: string) => {
    try {
        const reportRef = doc(firestore, 'reports', reportID);
        await updateDoc(reportRef, { assigned_to: workerID, status: 'Assigned', updated_at: new Date()});
        
    } catch (error) {
        console.error('Assign Task To Worker Error: ', error);
        throw error;
    }
}

export const getUserTrackingReport = async (userID: string) => {
    try {
        const userTrackQuery = query(collection(firestore, 'user_track'), where('user_id', '==', userID), orderBy('created_at', 'desc'));
        const userTrackSnapshot = await getDocs(userTrackQuery);

        const reportIDs = userTrackSnapshot.docs.map((doc) => doc.data().report_id);

        if(reportIDs.length === 0){
            return [];
        }

        const report = []

        for(const reportID of reportIDs){
            const reportRef = doc(firestore, 'reports', reportID);
            const reportSnapshot = await getDoc(reportRef);

            if (reportSnapshot.exists){
                report.push({
                    report_id: reportID,
                    ...reportSnapshot.data()
                });
            }
        }

        return report;
        
    } catch (error) {
        console.error('Error getting user tracked reports:', error)
        throw error;
    }
}