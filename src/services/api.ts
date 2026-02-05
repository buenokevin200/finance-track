import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// Create a new instance
const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add credentials
api.interceptors.request.use(
    (config) => {
        const { fireflyUrl, fireflyToken } = useAuthStore.getState();

        if (fireflyUrl) {
            config.baseURL = fireflyUrl.endsWith('/') ? fireflyUrl : `${fireflyUrl}/`;
        }

        if (fireflyToken) {
            config.headers['Authorization'] = fireflyToken.startsWith('Bearer ')
                ? fireflyToken
                : `Bearer ${fireflyToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized access to Firefly III');
            // Optionally handle token expiration
        }
        return Promise.reject(error);
    }
);

export default api;
