import {
  onAuthStateChanged,
  NextOrObserver,
  User,
  signOut as logOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@frontend/lib/firebase";

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

export { handleAuth, signOut, createAccountWithEmailAndPassword, signin };
