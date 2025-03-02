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
                userType,
                createdAt,
                updatedAt,
                active_task
            });
        }else{

        await setDoc(doc(firestore, 'user', docID), {
            fullname,
            email,
            phone_number: phoneNumber,
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

//report
export const addReport = async (report: any) => {
    
};

export const getReport = async () => {
    try{
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userType = await AsyncStorage.getItem('userType');
        let reportQuery;
        
        if (userType === 'Maintenance Worker') {
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
        
        // Include the document ID with each report
        return reportSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Get Report Error: ', error);
        throw error;
    }
};


// export const addDummyReports = async () => {
//     try {
//         const reports = [
//             // Unassigned Reports
//             {
//                 report_id: 'RPT001',
//                 user_id: 'U101',
//                 building_id: 'B1',
//                 facility_id: 'F10',
//                 request_attachment_id: null,
//                 equipment_id: 'E1001',
//                 fault_id: 'FL2001',
//                 description: 'Air conditioner not working in Room 305',
//                 priority: 'High',
//                 status: 'Pending',
//                 assigned_to: null, // Not assigned yet
//                 submitted_at: new Date(),
//                 acknowledge_at: null,
//                 assigned_at: null,
//                 resolved_at: null,
//                 closed_at: null,
//                 updated_at: new Date(),
//                 is_deleted: false
//             },
//             {
//                 report_id: 'RPT002',
//                 user_id: 'U102',
//                 building_id: 'B2',
//                 facility_id: 'F11',
//                 request_attachment_id: null,
//                 equipment_id: 'E1002',
//                 fault_id: 'FL2002',
//                 description: 'Water leakage in the pantry area',
//                 priority: 'Medium',
//                 status: 'Pending',
//                 assigned_to: null, // Not assigned yet
//                 submitted_at: new Date(),
//                 acknowledge_at: null,
//                 assigned_at: null,
//                 resolved_at: null,
//                 closed_at: null,
//                 updated_at: new Date(),
//                 is_deleted: false
//             },
//             {
//                 report_id: 'RPT003',
//                 user_id: 'U103',
//                 building_id: 'B1',
//                 facility_id: 'F12',
//                 request_attachment_id: null,
//                 equipment_id: 'E1003',
//                 fault_id: 'FL2003',
//                 description: 'Projector in Lecture Hall not functioning',
//                 priority: 'High',
//                 status: 'Pending',
//                 assigned_to: null, // Not assigned yet
//                 submitted_at: new Date(),
//                 acknowledge_at: null,
//                 assigned_at: null,
//                 resolved_at: null,
//                 closed_at: null,
//                 updated_at: new Date(),
//                 is_deleted: false
//             },
//             // Assigned Reports
//             {
//                 report_id: 'RPT004',
//                 user_id: 'U104',
//                 building_id: 'B3',
//                 facility_id: 'F13',
//                 request_attachment_id: null,
//                 equipment_id: 'E1004',
//                 fault_id: 'FL2004',
//                 description: 'Lights flickering in corridor',
//                 priority: 'Low',
//                 status: 'Assigned',
//                 assigned_to: 'Worker201', // Assigned to a worker
//                 submitted_at: new Date(),
//                 acknowledge_at: new Date(),
//                 assigned_at: new Date(),
//                 resolved_at: null,
//                 closed_at: null,
//                 updated_at: new Date(),
//                 is_deleted: false
//             },
//             {
//                 report_id: 'RPT005',
//                 user_id: 'U105',
//                 building_id: 'B2',
//                 facility_id: 'F14',
//                 request_attachment_id: null,
//                 equipment_id: 'E1005',
//                 fault_id: 'FL2005',
//                 description: 'Door lock broken in restroom',
//                 priority: 'High',
//                 status: 'Assigned',
//                 assigned_to: 'Worker202', // Assigned to a worker
//                 submitted_at: new Date(),
//                 acknowledge_at: new Date(),
//                 assigned_at: new Date(),
//                 resolved_at: null,
//                 closed_at: null,
//                 updated_at: new Date(),
//                 is_deleted: false
//             }
//         ];

//         // Insert each report as a document in Firestore
//         const batch = writeBatch(firestore);
//         const reportsCollection = collection(firestore, 'reports');

//         reports.forEach((report) => {
//             const reportRef = reportsCollection.doc(report.report_id);
//             batch.set(reportRef, report);
//         });

//         await batch.commit();
//         console.log('Dummy reports added successfully');
//     } catch (error) {
//         console.error('Error adding dummy reports: ', error);
//     }
// };

