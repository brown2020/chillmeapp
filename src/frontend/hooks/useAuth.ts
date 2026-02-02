import { auth } from "@/frontend/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import {
  handleAuth,
  signOut,
  createAccountWithEmailAndPassword,
  signin,
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
        description: error.message || "An error occurred during sign in",
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
      const error = err as Error;
      toast({
        title: "Error in creating account",
        description:
          error.message || "There is an error in creating an account for you",
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
      const error = err as Error;
      toast({
        title: "Error in signing in",
        description:
          error.message || "There is an error in creating an account for you",
        variant: "error",
      });
    }
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
  };
};
