// ./src/config/firebase.js
import { initializeApp } from '@react-native-firebase/app';


const firebaseConfig = {
  apiKey: 'AIzaSyB_mJRvKQFwj3-szbCrgjV7NL1Iipq5Apk',
  authDomain: 'fyp-facility-helpdesk.firebaseapp.com',
  projectId: 'fyp-facility-helpdesk',
  storageBucket: 'fyp-facility-helpdesk.appspot.com',
  messagingSenderId: '10101010101010101010',
  appId: '1:886220198553:android:59db4428660e99b3f01e08',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);


export { firebaseApp };