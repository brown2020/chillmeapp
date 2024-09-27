type UserSnapshot = {
  isInvited: boolean;
  firebaseUid: string;
  isAllowed: boolean;
  authPhotoUrl: string;
  credits: number;
  authReady: boolean;
  uid: string;
  authDisplayName: string;
  premium: boolean;
  lastSignIn: {
    seconds: number;
    nanoseconds: number;
  };
  authEmailVerified: boolean;
  authPending: boolean;
  isAdmin: boolean;
  authEmail: string;
};
