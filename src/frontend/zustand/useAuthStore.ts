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
  isAuthenticating: true,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...defaultAuthState,

  setAuthDetails: async (details: Partial<AuthState>) => {
    const { ...oldState } = get();
    const newState = { ...oldState, ...details };
    set(newState);
  },

  clearAuthDetails: () => set({ ...defaultAuthState }),

  setIsAuthenticating: (authenticating: boolean) => {
    set((state) => ({ ...state, isAuthenticating: authenticating }));
  },
}));
