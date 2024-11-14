const config = {
  appSecret: process.env.APP_SECRET,
  appAccessKey: process.env.APP_ACCESS_KEY,

  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
  },
  stripe: {
    pubKey: process.env.STRIPE_PUB_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
};

export default config;
