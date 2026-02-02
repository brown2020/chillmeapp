import { auth } from "@/frontend/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import {
  handleAuth,
  signOut,
  createAccountWithEmailAndPassword,
  signin,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getFirebaseErrorMessage,
} from "../services/auth";
import { useToast } from "@frontend/hooks";

export const useAuth = () => {
  const {
    setAuthDetails,
    isAuthenticating,
    user,
    setIsAuthenticating,
    clearAuthDetails,
  } = useAuthStore();
  const isLogged = Boolean(user?.uid);
  const { toast } = useToast();

  const checkAuthState = () => {
    const unsubscribe = handleAuth((user) => {
      if (user?.uid) {
        setLoggedInState(user);
        return;
      }
      setIsAuthenticating(false);
    });
    return unsubscribe;
  };

  const setLoggedOutState = async () => {
    await signOut();
    clearAuthDetails();
  };

  const setLoggedInState = (user: User) => {
    setAuthDetails({
      user: user,
      isAuthenticating: false,
    });
  };

  const signinWithGoogle = async () => {
    try {
      const googleAuthProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      setLoggedInState(result.user);
      return credential;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      // Ignore cancelled popup errors (user closed the popup)
      if (
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        return null;
      }
      toast({
        title: "Error signing in with Google",
        description: error.code
          ? getFirebaseErrorMessage(error.code)
          : "An error occurred during sign in",
        variant: "error",
      });
      throw err;
    }
  };

  const createAccount = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      await createAccountWithEmailAndPassword(email, password);
      toast({
        title: "Account Created",
        description: "Your account created, Logging you in...",
        variant: "success",
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      toast({
        title: "Error in creating account",
        description: error.code
          ? getFirebaseErrorMessage(error.code)
          : "There is an error in creating an account for you",
        variant: "error",
      });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signin(email, password);
      toast({
        title: "Login credentials validated",
        description: "Logging you in...",
        variant: "success",
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      toast({
        title: "Error in signing in",
        description: error.code
          ? getFirebaseErrorMessage(error.code)
          : "Invalid email or password",
        variant: "error",
      });
    }
  };

  /**
   * Send password reset email
   */
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(email);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the reset link",
        variant: "success",
      });
      return true;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      toast({
        title: "Error sending reset email",
        description: error.code
          ? getFirebaseErrorMessage(error.code)
          : "Unable to send password reset email",
        variant: "error",
      });
      return false;
    }
  };

  /**
   * Send email link for passwordless sign-in
   */
  const sendLoginLink = async (email: string): Promise<boolean> => {
    try {
      await sendSignInLinkToEmail(email);
      toast({
        title: "Login link sent",
        description: "Check your inbox for the sign-in link",
        variant: "success",
      });
      return true;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      toast({
        title: "Error sending login link",
        description: error.code
          ? getFirebaseErrorMessage(error.code)
          : "Unable to send login link",
        variant: "error",
      });
      return false;
    }
  };

  /**
   * Complete email link sign-in
   */
  const completeEmailLinkSignIn = async (url: string): Promise<boolean> => {
    // Check if this is a valid email link
    if (!isSignInWithEmailLink(url)) {
      return false;
    }

    // Get the email from localStorage
    let email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      // If no email in storage, we can't complete sign-in
      // The form should prompt for email
      return false;
    }

    try {
      const result = await signInWithEmailLink(email, url);
      setLoggedInState(result.user);
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
        variant: "success",
      });
      return true;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      toast({
        title: "Error signing in",
        description: error.code
          ? getFirebaseErrorMessage(error.code)
          : "Unable to complete sign-in",
        variant: "error",
      });
      return false;
    }
  };

  /**
   * Check if URL is an email sign-in link
   */
  const checkIsEmailSignInLink = (url: string): boolean => {
    return isSignInWithEmailLink(url);
  };

  return {
    signinWithGoogle,
    checkAuthState,
    setLoggedOutState,
    isAuthenticating,
    user,
    isLogged,
    createAccount,
    loginWithEmail,
    sendPasswordReset,
    sendLoginLink,
    completeEmailLinkSignIn,
    checkIsEmailSignInLink,
  };
};
