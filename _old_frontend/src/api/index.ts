import axios from 'axios';
import type { Lead } from './types';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

export const leadsApi = {
    getAll: async (): Promise<Lead[]> => {
        const response = await api.get('/leads');
        return response.data;
    },

    getById: async (id: number): Promise<Lead> => {
        const response = await api.get(`/leads/${id}`);
        return response.data;
    },

    sendEmail: async (id: number): Promise<{ status: string; message: string }> => {
        const response = await api.post(`/leads/${id}/send-email`);
        return response.data;
    },

    updateAnalysis: async (id: number, data: { generated_email?: string }): Promise<{ status: string }> => {
        const response = await api.patch(`/leads/${id}/analysis`, data);
        return response.data;
    },

    refineEmail: async (id: number, instruction: string): Promise<{ status: string; refined_email: string }> => {
        const response = await api.post(`/leads/${id}/refine-email`, { instruction });
        return response.data;
    },

    getPosterData: async (id: number): Promise<any> => {
        const response = await api.get(`/leads/${id}/poster-data`);
        return response.data;
    },
    deleteAll: async (): Promise<{ status: string; message: string }> => {
        const response = await api.delete('/leads');
        return response.data;
    },
    analyze: async (id: number): Promise<{ status: string; message: string }> => {
        const response = await api.post(`/leads/${id}/analyze`);
        return response.data;
    },
};

export const searchApi = {
    search: async (query: string, location?: string): Promise<Lead[]> => {
        const response = await api.post('/leads/search', null, {
            params: { query, location }
        });
        return response.data;
    },
};
