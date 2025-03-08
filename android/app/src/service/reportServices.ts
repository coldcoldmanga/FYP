import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy } from '@react-native-firebase/firestore';
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