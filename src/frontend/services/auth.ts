import {
  onAuthStateChanged,
  NextOrObserver,
  User,
  signOut as logOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendSignInLinkToEmail as firebaseSendSignInLinkToEmail,
  isSignInWithEmailLink as firebaseIsSignInWithEmailLink,
  signInWithEmailLink as firebaseSignInWithEmailLink,
} from "firebase/auth";
import { auth } from "@frontend/lib/firebase";

/**
 * Map Firebase error codes to user-friendly messages
 */
export const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password":
      "Password is too weak. Please use a stronger password.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/expired-action-code":
      "This link has expired. Please request a new one.",
    "auth/invalid-action-code":
      "This link is invalid. Please request a new one.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/cancelled-popup-request": "Sign-in was cancelled.",
  };

  return (
    errorMessages[code] || "An unexpected error occurred. Please try again."
  );
};

const handleAuth = (cb: NextOrObserver<User>) => {
  const handler = onAuthStateChanged(auth, cb);
  return handler;
};

const signOut = async () => {
  await logOut(auth);
};

const createAccountWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result;
};

const signin = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result;
};

/**
 * Send password reset email to the user
 */
const sendPasswordResetEmail = async (email: string) => {
  await firebaseSendPasswordResetEmail(auth, email);
};

/**
 * Send sign-in link to email (passwordless authentication)
 */
const sendSignInLinkToEmail = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/verify-email`,
    handleCodeInApp: true,
  };
  await firebaseSendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Save email to localStorage for completing sign-in
  window.localStorage.setItem("emailForSignIn", email);
};

/**
 * Check if the current URL is a sign-in with email link
 */
const isSignInWithEmailLink = (url: string): boolean => {
  return firebaseIsSignInWithEmailLink(auth, url);
};

/**
 * Complete sign-in with email link
 */
const signInWithEmailLink = async (email: string, url: string) => {
  const result = await firebaseSignInWithEmailLink(auth, email, url);
  // Clear the stored email
  window.localStorage.removeItem("emailForSignIn");
  return result;
};

export {
  handleAuth,
  signOut,
  createAccountWithEmailAndPassword,
  signin,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
};
