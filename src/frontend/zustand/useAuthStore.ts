import { db } from "@/frontend/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { create } from "zustand";
import { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  isAuthenticating: boolean;
}

interface AuthActions {
  setAuthDetails: (details: Partial<AuthState>) => void;
  clearAuthDetails: () => void;
  setIsAuthenticating: (authenticating: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  user: null,
  isAuthenticating: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...defaultAuthState,

  setAuthDetails: async (details: Partial<AuthState>) => {
    const { ...oldState } = get();
    const newState = { ...oldState, ...details };
    set(newState);
    await updateUserDetailsInFirestore(newState, get().user?.uid || "");
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),

  setIsAuthenticating: (authenticating: boolean) => {
    console.log("setting", { authenticating });
    set((state) => ({ ...state, isAuthenticating: authenticating }));
  },
}));

async function updateUserDetailsInFirestore(
  details: Partial<AuthState>,
  uid: string,
) {
  if (uid) {
    const userRef = doc(db, `users/${uid}`);

    // Sanitize the details object to exclude any functions
    const sanitizedDetails = { ...details };

    // Remove any unexpected functions or properties
    Object.keys(sanitizedDetails).forEach((key) => {
      if (typeof sanitizedDetails[key as keyof AuthState] === "function") {
        delete sanitizedDetails[key as keyof AuthState];
      }
    });

    try {
      await setDoc(
        userRef,
        { ...sanitizedDetails, lastSignIn: serverTimestamp() },
        { merge: true },
      );
    } catch (error) {
      console.error("Error updating auth details in Firestore:", error);
    }
  }
}
