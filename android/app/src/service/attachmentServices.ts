import { firebaseApp } from '../config/firebase';
import { setDoc, doc, updateDoc, query, where, collection, getDocs, getFirestore, writeBatch, orderBy, deleteDoc, getDoc } from '@react-native-firebase/firestore';

const firestore = getFirestore(firebaseApp);

export const addAttachment = async (report_id:string, attachment: any) => {
    try{
        const attachmentRef = doc(collection(firestore, 'reports', report_id, 'attachments'))
        await setDoc(attachmentRef, attachment);
        
    }catch(error){
        console.error('Error adding attachment:', error);
        throw error;
    }
}

export const getAttachments = async (report_id:string) => {
    try{
        const attachmentRef = collection(firestore, 'reports', report_id, 'attachments')
        const snapshot = await getDocs(attachmentRef);
        const attachments = snapshot.docs.map((doc) =>({
            attachment_id: doc.id,
            ...doc.data()
        }))
        return attachments;
    }catch(error){
        console.error('Error getting attachments:', error);
        throw error;
    }
}

export const getReportImages = async (report_id:string) => {
    try{
        const attachments = await getAttachments(report_id);
        const images = attachments.filter((attachment: any) => attachment.type === 'image');
        return images;
    }catch(error){
        console.error('Error getting report images:', error);
        throw error;
    }
}

