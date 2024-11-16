import { create } from "zustand";
import { User } from "firebase/auth";

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
}

type AuthStore = AuthState & AuthActions;

const defaultAuthState: AuthState = {
  user: null,
  profile: null,
  isAuthenticating: true,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
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
    set((state) => ({ ...state, isAuthenticating: authenticating }));
  },
}));
