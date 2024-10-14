import {
  onAuthStateChanged,
  NextOrObserver,
  User,
  signOut as logOut,
} from "firebase/auth";
import { auth } from "@frontend/lib/firebase";

const handleAuth = (cb: NextOrObserver<User>) => {
  const handler = onAuthStateChanged(auth, cb);
  return handler;
};

const signOut = async () => {
  await logOut(auth);
};

export { handleAuth, signOut };
