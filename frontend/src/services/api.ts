// src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

// Adiciona token em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Trata erros de autenticação (token expirado)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se recebeu 401 e ainda não tentou renovar o token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('refresh');

            if (refresh) {
                try {
                    const res = await axios.post('http://localhost:8000/api/auth/refresh/', { refresh });
                    const newAccess = res.data.access;
                    localStorage.setItem('token', newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest); // tenta a requisição original novamente
                } catch {
                    // Refresh expirou — redireciona para login
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;