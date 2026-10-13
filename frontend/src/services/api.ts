import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 no próprio login = e-mail/senha errados (a tela de Login mostra a mensagem).
    // 401 em qualquer outra chamada = sessão expirada, aí sim limpa tudo e volta para o login.
    const ehTentativaDeLogin = error.config?.url === '/auth/login';
    if (error.response?.status === 401 && !ehTentativaDeLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
