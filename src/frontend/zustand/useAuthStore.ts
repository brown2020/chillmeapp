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

export const useAuthStore = create<AuthStore>((set) => ({
  ...defaultAuthState,

  setAuthDetails: (details: Partial<AuthState>) => {
    set((state) => ({ ...state, ...details }));
  },

  clearAuthDetails: () => set({ ...defaultAuthState, isAuthenticating: false }),

  setIsAuthenticating: (authenticating: boolean) => {
    set({ isAuthenticating: authenticating });
  },
}));
