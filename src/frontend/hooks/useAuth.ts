import { auth } from "@/frontend/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useAuthStore } from "@frontend/zustand/useAuthStore";
import { handleAuth, signOut } from "../services/auth";

export const useAuth = () => {
  const {
    setAuthDetails,
    isAuthenticating,
    user,
    setIsAuthenticating,
    clearAuthDetails,
  } = useAuthStore();
  const isLogged = Boolean(user?.uid);

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

  return {
    signinWithGoogle,
    checkAuthState,
    setLoggedOutState,
    isAuthenticating,
    user,
    isLogged,
  };
};
