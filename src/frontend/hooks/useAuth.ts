import { auth } from "@/frontend/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { useAuthStore } from "@frontend/zustand/useAuthStore";

export const useAuth = () => {
  const { setAuthDetails } = useAuthStore();

  const setLoginState = (user: User) => {
    setAuthDetails({
      uid: user.uid,
      authEmail: user.email || "",
      authDisplayName: user.displayName || "",
      authPhotoUrl: user.photoURL || "",
      authEmailVerified: user.emailVerified || false,
      authReady: true,
      authPending: false,
    });
  };

  const signinWithGoogle = async () => {
    const googleAuthProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    setLoginState(result.user);
    return credential;
  };

  return {
    signinWithGoogle,
  };
};
