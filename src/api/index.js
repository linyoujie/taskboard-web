import axios from 'axios';

const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  baseURL: 'http://localhost:3306',
});

export default api;
