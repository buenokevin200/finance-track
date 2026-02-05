import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    loading: boolean;
    fireflyUrl: string | null;
    fireflyToken: string | null;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setFireflyConfig: (url: string, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    fireflyUrl: localStorage.getItem('firefly_url') || import.meta.env.VITE_FIREFLY_API_URL || null,
    fireflyToken: localStorage.getItem('firefly_token') || import.meta.env.VITE_FIREFLY_TOKEN || null,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setFireflyConfig: (url, token) => {
        localStorage.setItem('firefly_url', url);
        localStorage.setItem('firefly_token', token);
        set({ fireflyUrl: url, fireflyToken: token });
    },
    logout: () => {
        localStorage.removeItem('firefly_url');
        localStorage.removeItem('firefly_token');
        set({ user: null, fireflyUrl: null, fireflyToken: null });
    }
}));
