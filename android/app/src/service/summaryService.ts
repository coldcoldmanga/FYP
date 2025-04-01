import { getDocs, collection, getFirestore } from "@react-native-firebase/firestore";
import { firebaseApp } from "../config/firebase";

const firestore = getFirestore(firebaseApp);

export const getSummary = async () => {
    try {
        const summaryRef = collection(firestore, 'summaries').orderBy('created_at', 'desc');
        const snapshot = await getDocs(summaryRef);
        const data = snapshot.docs.map((doc) => ({
            doc_id: doc.id,
            ...doc.data()
        }));
        return data;
    } catch (error) {
        console.error('Error getting summary:', error);
        throw error;
    }
}
