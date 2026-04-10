import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent  } from "firebase/analytics";

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

export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  }
};

export const trackFirebaseEvent = (eventName: string, params?: any) => {
  if (analytics) {
    console.log(analytics);
    
    logEvent(analytics, eventName, params);
  }
};