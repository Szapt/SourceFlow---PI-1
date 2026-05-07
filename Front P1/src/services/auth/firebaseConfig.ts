// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCtvdx5qq6bqkVuSbMyDcmKnq-9aS1oex0",
    authDomain: "sourceflow-a6e77.firebaseapp.com",
    projectId: "sourceflow-a6e77",
    storageBucket: "sourceflow-a6e77.firebasestorage.app",
    messagingSenderId: "682836495818",
    appId: "1:682836495818:web:805d7ea4bd3ac7dd599333",
    measurementId: "G-2PE4EWZ3XY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);