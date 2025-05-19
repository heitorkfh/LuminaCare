// client/src/services/serviceApi.js
import api from './api';

export const serviceService = {
  getServices: async (params) => {
    const response = await api.get('/services', { params });
    return response.data;
  },
  
  getService: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },
  
  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },
  
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
  
  toggleServiceStatus: async (id) => {
    const response = await api.put(`/services/${id}/toggle-status`);
    return response.data;
  },
  
  // Categorias
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  
  toggleCategoryStatus: async (id) => {
    const response = await api.put(`/categories/${id}/toggle-status`);
    return response.data;
  },
  
  // Profissionais
  getProfessionals: async () => {
    const response = await api.get('/professionals');
    return response.data;
  },
  
  // Disponibilidade
  getServiceAvailability: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}/availability`);
    return response.data;
  },
  
  updateServiceAvailability: async (serviceId, availabilityData) => {
    const response = await api.put(`/services/${serviceId}/availability`, availabilityData);
    return response.data;
  },
  
  // Associar profissionais ao serviço
  assignProfessionalToService: async (serviceId, professionalId) => {
    const response = await api.post(`/services/${serviceId}/professionals`, { professionalId });
    return response.data;
  },
  
  removeProfessionalFromService: async (serviceId, professionalId) => {
    const response = await api.delete(`/services/${serviceId}/professionals/${professionalId}`);
    return response.data;
  },
  
  getServiceProfessionals: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}/professionals`);
    return response.data;
  }
};

export default serviceService;