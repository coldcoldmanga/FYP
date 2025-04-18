import { getDocs, collection, getFirestore, orderBy, query, deleteDoc, doc } from "@react-native-firebase/firestore";
import { firebaseApp } from "../config/firebase";

const firestore = getFirestore(firebaseApp);

export const getSummary = async () => {
    try {
        const summaryRef = collection(firestore, 'summaries')
        const summaryQuery = query(summaryRef, orderBy('created_at', 'desc'));
        const snapshot = await getDocs(summaryQuery);
        const data = snapshot.docs.map((doc) => ({
            summary_id: doc.id,
            ...doc.data()
        }));
        return data;
    } catch (error) {
        console.error('Error getting summary:', error);
        throw error;
    }
}

export const deleteSummary = async(summary_id: string) => {
    try {
        const summaryRef = doc(firestore, 'summaries', summary_id);
        await deleteDoc(summaryRef);

    } catch (error) {
        console.error("Error deleting summary: ", error);
        throw error;
    }
}


