import { auth } from "@/frontend/lib/firebaseClient";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const useAuth = () => {
  const signinWithGoogle = async () => {
    const googleAuthProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    return credential;
  };

  return {
    signinWithGoogle,
  };
};
