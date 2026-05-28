import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};