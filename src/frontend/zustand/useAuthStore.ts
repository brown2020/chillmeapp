import { User } from "firebase/auth";
import { composeStore } from "@/utils/storeComposer";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticating: boolean;
}

interface AuthActions {
  setAuthDetails: (details: Partial<AuthState>) => void;
  clearAuthDetails: () => void;
  setIsAuthenticating: (authenticating: boolean) => void;
  setProfileData: (payload: UserProfile) => Promise<void>;
  updateUserAuthInfo: (payload: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  user: null,
  profile: null,
  isAuthenticating: true,
};

// Correctly type the state creator with devtools mutator
export const useAuthStore = composeStore<AuthStore>(
  (set, get) => ({
    ...defaultAuthState,

    setAuthDetails: async (details: Partial<AuthState>) => {
      const { ...oldState } = get();
      const newState = { ...oldState, ...details };
      set(newState);
    },

    setProfileData: async (payload: UserProfile) => {
      set({ profile: payload });
    },

    clearAuthDetails: () => set({ ...defaultAuthState }),

    setIsAuthenticating: (authenticating: boolean) => {
      set((state: AuthState) => ({
        ...state,
        isAuthenticating: authenticating,
      }));
    },

    updateUserAuthInfo: (payload) => {
      set((state) => ({
        ...state,
        user: {
          ...(state.user as User),
          ...payload,
        },
      }));
    },
  }),
  { name: "AuthStore" },
);
