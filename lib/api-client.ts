import type { Lead } from './types';

export const leadsApi = {
  getAll: async (): Promise<Lead[]> => {
    const response = await fetch('/api/leads');
    if (!response.ok) throw new Error('Failed to fetch leads');
    return response.json();
  },

  getById: async (id: number): Promise<Lead> => {
    const response = await fetch(`/api/leads/${id}`);
    if (!response.ok) throw new Error('Failed to fetch lead');
    return response.json();
  },

  sendEmail: async (id: number): Promise<{ status: string; message: string }> => {
    const response = await fetch(`/api/leads/${id}/send-email`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to send email');
    return response.json();
  },

  sendCustomEmail: async (id: number, payload: { toEmail?: string; subject: string; content: string; stage?: string }): Promise<{ status: string; message: string }> => {
    const response = await fetch(`/api/leads/${id}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to dispatch email');
    }
    return response.json();
  },

  updateLead: async (id: number, data: Partial<Lead>): Promise<Lead> => {
    const response = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update lead');
    return response.json();
  },

  updateAnalysis: async (id: number, data: { generated_email?: string }): Promise<{ status: string }> => {
    const response = await fetch(`/api/leads/${id}/analysis`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update analysis');
    return response.json();
  },

  refineEmail: async (id: number, instruction: string): Promise<{ status: string; refined_email: string }> => {
    const response = await fetch(`/api/leads/${id}/refine-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction }),
    });
    if (!response.ok) throw new Error('Failed to refine email');
    return response.json();
  },

  getPosterData: async (id: number): Promise<any> => {
    const response = await fetch(`/api/leads/${id}/poster-data`);
    if (!response.ok) throw new Error('Failed to fetch poster data');
    return response.json();
  },

  deleteAll: async (): Promise<{ status: string; message: string }> => {
    const response = await fetch('/api/leads', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear database');
    return response.json();
  },

  analyze: async (id: number): Promise<{ status: string; message: string }> => {
    const response = await fetch(`/api/leads/${id}/analyze`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trigger analysis');
    return response.json();
  },
};

export const searchApi = {
  search: async (query: string, location?: string): Promise<Lead[]> => {
    const response = await fetch(`/api/leads/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location || '')}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },
};
