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
import {
  clearSessionCookie,
  syncSessionCookie,
} from "@/frontend/services/session-client";

function authCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function logAuthFailure(context: string, err: unknown) {
  const code = authCode(err) ?? "unknown";
  console.warn(`[auth] ${context}: ${code}`);
}

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
    const unsubscribe = handleAuth((authUser) => {
      void (async () => {
        if (authUser?.uid) {
          await setLoggedInState(authUser);
          return;
        }

        clearAuthDetails();
        setIsAuthenticating(false);
      })();
    });
    return unsubscribe;
  };

  const setLoggedOutState = async () => {
    await clearSessionCookie();
    await signOut();
    clearAuthDetails();
  };

  const setLoggedInState = async (authUser: User) => {
    try {
      const idToken = await authUser.getIdToken();
      await syncSessionCookie(idToken);
    } catch (error) {
      logAuthFailure("session-sync", error);
    }

    setAuthDetails({
      user: authUser,
      isAuthenticating: false,
    });
  };

  const signinWithGoogle = async () => {
    try {
      const googleAuthProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleAuthProvider);
      await setLoggedInState(result.user);
      return GoogleAuthProvider.credentialFromResult(result);
    } catch (err: unknown) {
      const code = authCode(err);
      if (
        code === "auth/cancelled-popup-request" ||
        code === "auth/popup-closed-by-user"
      ) {
        logAuthFailure("google-cancelled", err);
        return null;
      }
      logAuthFailure("google-sign-in", err);
      toast({
        title: "Error signing in with Google",
        description: code
          ? getFirebaseErrorMessage(code)
          : "An error occurred during sign in",
        variant: "error",
      });
      return null;
    }
  };

  const createAccount = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      const result = await createAccountWithEmailAndPassword(email, password);
      await setLoggedInState(result.user);
      toast({
        title: "Account Created",
        description: "Your account created, Logging you in...",
        variant: "success",
      });
    } catch (err: unknown) {
      const code = authCode(err);
      logAuthFailure("sign-up", err);
      toast({
        title: "Error in creating account",
        description: code
          ? getFirebaseErrorMessage(code)
          : "There is an error in creating an account for you",
        variant: "error",
      });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signin(email, password);
      await setLoggedInState(result.user);
      toast({
        title: "Login credentials validated",
        description: "Logging you in...",
        variant: "success",
      });
    } catch (err: unknown) {
      const code = authCode(err);
      logAuthFailure("sign-in", err);
      toast({
        title: "Error in signing in",
        description: code
          ? getFirebaseErrorMessage(code)
          : "Invalid email or password",
        variant: "error",
      });
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(email);
      toast({
        title: "Password reset email sent",
        description:
          "If an account uses that email, a password reset link will arrive shortly.",
        variant: "success",
      });
      return true;
    } catch (err: unknown) {
      const code = authCode(err);
      logAuthFailure("password-reset", err);
      toast({
        title: "Error sending reset email",
        description: code
          ? getFirebaseErrorMessage(code)
          : "Unable to send password reset email",
        variant: "error",
      });
      return false;
    }
  };

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
      const code = authCode(err);
      logAuthFailure("login-link", err);
      toast({
        title: "Error sending login link",
        description: code
          ? getFirebaseErrorMessage(code)
          : "Unable to send login link",
        variant: "error",
      });
      return false;
    }
  };

  const completeEmailLinkSignIn = async (url: string): Promise<boolean> => {
    if (!isSignInWithEmailLink(url)) {
      return false;
    }

    const email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      return false;
    }

    try {
      const result = await signInWithEmailLink(email, url);
      await setLoggedInState(result.user);
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
        variant: "success",
      });
      return true;
    } catch (err: unknown) {
      const code = authCode(err);
      logAuthFailure("email-link", err);
      toast({
        title: "Error signing in",
        description: code
          ? getFirebaseErrorMessage(code)
          : "Unable to complete sign-in",
        variant: "error",
      });
      return false;
    }
  };

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
