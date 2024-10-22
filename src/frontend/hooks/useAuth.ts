import { auth } from "@/frontend/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import {
  handleAuth,
  signOut,
  createAccountWithEmailAndPassword,
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
    setIsAuthenticating(true);
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
    signOut();
    clearAuthDetails();
  };

  const setLoggedInState = (user: User) => {
    setAuthDetails({
      user: user,
      isAuthenticating: false,
    });
  };

  const signinWithGoogle = async () => {
    const googleAuthProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    setLoggedInState(result.user);
    return credential;
  };

  const createAccount = async (email: string, password: string) => {
    try {
      await createAccountWithEmailAndPassword(email, password);
      toast({
        title: "Account Created",
        description: "Your account created, Please login",
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

  return {
    signinWithGoogle,
    checkAuthState,
    setLoggedOutState,
    isAuthenticating,
    user,
    isLogged,
    createAccount,
  };
};
