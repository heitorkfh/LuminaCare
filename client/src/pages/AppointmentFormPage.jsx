// client/src/pages/AppointmentFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { appointmentService, patientService, userService } from '../services/api';
import { toast } from 'react-toastify';

const AppointmentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patientId');
  
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  
  // Estado inicial do formulário
  const initialFormState = {
    patientId: patientIdFromQuery || '',
    professionalId: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    status: 'SCHEDULED',
    type: 'Consulta',
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  // Carregar dados do agendamento para edição
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAppointment(id);
        
        // Formatar a data e hora para os inputs
        const scheduledDate = new Date(data.scheduledDate);
        const formattedDate = scheduledDate.toISOString().split('T')[0];
        const formattedTime = scheduledDate.toTimeString().slice(0, 5);
        
        setFormData({
          patientId: data.patientId,
          professionalId: data.professionalId,
          scheduledDate: formattedDate,
          scheduledTime: formattedTime,
          duration: data.duration,
          status: data.status,
          type: data.type || 'Consulta',
          notes: data.notes || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        toast.error('Erro ao carregar dados do agendamento');
        setLoading(false);
        navigate('/appointments');
      }
    };
    
    if (isEditMode) {
      fetchAppointment();
    }
  }, [id, isEditMode, navigate]);
  
  // Carregar lista de pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await patientService.getPatients({ limit: 100 });
        setPatients(response.data || []);
        setLoadingPatients(false);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast.error('Erro ao carregar lista de pacientes');
        setLoadingPatients(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  // Carregar lista de profissionais
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoadingProfessionals(true);
        const response = await userService.getUsers({ role: 'PROFESSIONAL' });
        setProfessionals(response.data || []);
        setLoadingProfessionals(false);
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        toast.error('Erro ao carregar lista de profissionais');
        setLoadingProfessionals(false);
      }
    };
    
    fetchProfessionals();
  }, []);
  
  // Lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.patientId || !formData.professionalId || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setSaving(true);
      
      // Combinar data e hora
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const appointmentData = {
        patientId: formData.patientId,
        professionalId: formData.professionalId,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: parseInt(formData.duration),
        status: formData.status,
        type: formData.type,
        notes: formData.notes
      };
      
      if (isEditMode) {
        await appointmentService.updateAppointment(id, appointmentData);
        toast.success('Agendamento atualizado com sucesso');
      } else {
        await appointmentService.createAppointment(appointmentData);
        toast.success('Agendamento criado com sucesso');
      }
      
      setSaving(false);
      navigate('/appointments');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast.error('Erro ao salvar agendamento');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? 'Atualize as informações do agendamento' : 'Preencha as informações para criar um novo agendamento'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/appointments"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informações do Agendamento</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalhes da consulta ou procedimento</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Paciente <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="patientId"
                    name="patientId"
                    required
                    value={formData.patientId}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={loadingPatients}
                  >
                    <option value="">Selecione um paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700">
                  Profissional <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="professionalId"
                    name="professionalId"
                    required
                    value={formData.professionalId}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    disabled={loadingProfessionals}
                  >
                    <option value="">Selecione um profissional</option>
                    {professionals.map(professional => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                  Data <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="scheduledDate"
                    id="scheduledDate"
                    required
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                  Horário <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="scheduledTime"
                    id="scheduledTime"
                    required
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duração (minutos)
                </label>
                <div className="mt-1">
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1 hora e 30 minutos</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="SCHEDULED">Agendado</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="CANCELED">Cancelado</option>
                    <option value="COMPLETED">Concluído</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="type"
                    id="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ex: Consulta, Retorno, Exame"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Informações adicionais sobre o agendamento"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentFormPage;