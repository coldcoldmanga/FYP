import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { firebaseApp } from "../config/firebase";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, orderBy, limit } from "@react-native-firebase/firestore";

const firestore = getFirestore(firebaseApp);

export const addNotification = async (title: string, message: string, userID: string[], userRole: string) => {
    try{
        const notificationRef = collection(firestore, 'notification');
        if(userRole === "Admin"){
            await setDoc(doc(notificationRef), {
                title: title,
                message: message,
                target_user_role: userRole,
                created_at: new Date()
            });
        }else{
            await setDoc(doc(notificationRef), {
                title: title,
                message: message,
                target_user_ids: userID,
                created_at: new Date()
            });
        }

        return true;
    } catch(error){
        console.error('Error adding notification:', error);
        return false;
    }

}

export const getNotification = async (userID: string) => {
    try {
        const notificationRef = collection(firestore, 'notification');
        const notificationQuery = query(notificationRef, where('target_user_ids', 'array-contains', userID), orderBy('created_at', 'desc'), limit(10));
        const snapshot = await getDocs(notificationQuery);
        const notificationData = snapshot.docs.map((doc) => ({
            notification_id: doc.id,
            ...doc.data()
        }));

        return notificationData;
        
    } catch (error) {
        console.error('Error getting notification:', error);
        return [];
    }
}

export const getNotificationForAdmin = async () => {
    try {
        const notificationRef = collection(firestore, 'notification');
        const notificationQuery = query(notificationRef, where('target_user_role', '==', 'Admin'), orderBy('created_at', 'desc'), limit(10));
        const notificationSnapshot = await getDocs(notificationQuery);
        const notificationData = notificationSnapshot.docs.map((doc) => ({
            notification_id: doc.id,
            ...doc.data()
        }));

        return notificationData;
    } catch (error) {
        console.error('Error getting notification for admin:', error);
        return [];

    }
}

