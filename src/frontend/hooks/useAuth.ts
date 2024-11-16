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
import { findUserById, configureUserAfterSignup } from "@backend/services/user";

export const useAuth = () => {
  const {
    setAuthDetails,
    isAuthenticating,
    user,
    profile,
    setIsAuthenticating,
    clearAuthDetails,
    setProfileData,
  } = useAuthStore();
  const isLogged = Boolean(user?.uid);
  const { toast } = useToast();

  const checkAuthState = () => {
    const unsubscribe = handleAuth(async (user) => {
      try {
        if (user?.uid) {
          let userProfile = await findUserById(user.uid);
          if (!userProfile || !userProfile.stripeCustomerId) {
            await configureUserAfterSignup(user.uid, user.email as string);
            userProfile = await findUserById(user.uid);
          }
          if (userProfile) {
            setProfileDetails(userProfile);
          }
          setLoggedInState(user);
          return;
        }
        setIsAuthenticating(false);
      } catch (error) {
        console.log(error);
      }
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

  const setProfileDetails = (profile: UserProfile) => {
    setProfileData(profile);
  };

  const signinWithGoogle = async () => {
    const googleAuthProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    setLoggedInState(result.user);
    return credential;
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
    setProfileDetails,
    profile,
  };
};
