import { onAuthStateChanged, NextOrObserver, User } from "firebase/auth";
import { auth } from "@frontend/lib/firebase";

const handleAuth = (cb: NextOrObserver<User>) => {
  const handler = onAuthStateChanged(auth, cb);
  return handler;
};

export { handleAuth };
