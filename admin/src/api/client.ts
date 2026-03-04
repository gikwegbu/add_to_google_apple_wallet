import axios from 'axios';

const client = axios.create({
    // baseURL: 'http://localhost:3000', // Hardcoded for now, should use env
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
