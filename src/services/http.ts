import axios from 'axios';
import { API_BASE } from '../config/api';

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// (Opcional) Interceptor para loguear errores
http.interceptors.response.use(
  (r) => r,
  (err) => {
    // console.log('[HTTP ERROR]', err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);