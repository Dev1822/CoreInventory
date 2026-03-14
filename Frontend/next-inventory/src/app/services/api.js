'use client';

import api from '@/utils/api';

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivity: (params) => api.get('/dashboard/activity', { params }),
    getAlerts: () => api.get('/dashboard/alerts'),
};

export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getOne: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const warehousesAPI = {
    getAll: () => api.get('/warehouses'),
    getOne: (id) => api.get(`/warehouses/${id}`),
    create: (data) => api.post('/warehouses', data),
    update: (id, data) => api.put(`/warehouses/${id}`, data),
    delete: (id) => api.delete(`/warehouses/${id}`),
};

export const receiptsAPI = {
    getAll: (params) => api.get('/receipts', { params }),
    getOne: (id) => api.get(`/receipts/${id}`),
    create: (data) => api.post('/receipts', data),
    update: (id, data) => api.put(`/receipts/${id}`, data),
    delete: (id) => api.delete(`/receipts/${id}`),
    validate: (id) => api.post(`/receipts/${id}/validate`),
};

export const deliveriesAPI = {
    getAll: (params) => api.get('/deliveries', { params }),
    getOne: (id) => api.get(`/deliveries/${id}`),
    create: (data) => api.post('/deliveries', data),
    update: (id, data) => api.put(`/deliveries/${id}`, data),
    delete: (id) => api.delete(`/deliveries/${id}`),
    validate: (id) => api.post(`/deliveries/${id}/validate`),
};

export const transfersAPI = {
    getAll: (params) => api.get('/transfers', { params }),
    getOne: (id) => api.get(`/transfers/${id}`),
    create: (data) => api.post('/transfers', data),
    update: (id, data) => api.put(`/transfers/${id}`, data),
    delete: (id) => api.delete(`/transfers/${id}`),
    validate: (id) => api.post(`/transfers/${id}/validate`),
};

export const adjustmentsAPI = {
    getAll: (params) => api.get('/adjustments', { params }),
    getOne: (id) => api.get(`/adjustments/${id}`),
    create: (data) => api.post('/adjustments', data),
    update: (id, data) => api.put(`/adjustments/${id}`, data),
    delete: (id) => api.delete(`/adjustments/${id}`),
    validate: (id) => api.post(`/adjustments/${id}/validate`),
};

export const ledgerAPI = {
    getAll: (params) => api.get('/stock-ledger', { params }),
};
