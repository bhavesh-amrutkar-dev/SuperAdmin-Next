import { initializeApp } from "firebase/app";
import { initializeAnalytics, isSupported, logEvent } from "firebase/analytics";
 
const firebaseConfig = {
    apiKey: "AIzaSyAX-vu54c0lsNthzyjm64V-MqHniFuVu60",
    authDomain: "don-rifa.firebaseapp.com",
    databaseURL: "https://don-rifa.firebaseio.com",
    projectId: "don-rifa",
    storageBucket: "don-rifa.appspot.com",
    messagingSenderId: "372163631723",
    appId: "1:372163631723:web:0bc7a871a05744e8f6af2e",
    measurementId: "G-YRFMY9GL2H"
};
 
const app = initializeApp(firebaseConfig);
 
let analytics: any = null;
let isInitializing = false;
export const initAnalytics = async () => {
    if (analytics || isInitializing) return;
 
    if (typeof window !== "undefined") {
        isInitializing = true;
 
        const supported = await isSupported();
      if (supported) {
            analytics = initializeAnalytics(app);
            console.log("✅ Firebase Analytics Initialized");
        }
 
        isInitializing = false;
    }
};
export const trackFirebaseEvent = async (eventName: string, params?: any) => {
    if (!analytics) {
        await initAnalytics(); // 🔥 ensure initialized
    }
 
    if (analytics) {
        // console.log("🔥 Firebase Event:", eventName, params);
        logEvent(analytics, eventName, params);
    } else {
        console.warn("⚠️ Firebase analytics not initialized");
    }
};