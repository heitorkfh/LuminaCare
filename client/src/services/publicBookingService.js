// client/src/services/publicBookingService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Criar instância do axios para chamadas públicas (sem autenticação)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços para agendamento público
export const publicBookingService = {
  // Obter profissionais disponíveis para agendamento público
  getAvailableProfessionals: async () => {
    try {
      const response = await publicApi.get('/public/professionals');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar profissionais disponíveis:', error);
      throw error;
    }
  },
  
  // Obter horários disponíveis para um profissional em uma data específica
  getAvailableSlots: async (professionalId, date) => {
    try {
      const response = await publicApi.get(`/public/availability/${professionalId}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      throw error;
    }
  },
  
  // Criar um agendamento público
  createPublicAppointment: async (appointmentData) => {
    try {
      const response = await publicApi.post('/public/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  },
  
  // Verificar status de um agendamento público
  checkAppointmentStatus: async (appointmentId, verificationCode) => {
    try {
      const response = await publicApi.get(`/public/appointments/${appointmentId}/status`, {
        params: { code: verificationCode }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do agendamento:', error);
      throw error;
    }
  },
  
  // Cancelar um agendamento público
  cancelPublicAppointment: async (appointmentId, verificationCode, reason) => {
    try {
      const response = await publicApi.put(`/public/appointments/${appointmentId}/cancel`, {
        code: verificationCode,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      throw error;
    }
  }
};

export default publicBookingService;