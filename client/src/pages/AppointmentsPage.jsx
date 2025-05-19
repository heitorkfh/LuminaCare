// client/src/pages/AppointmentsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../services/api';
import { toast } from 'react-toastify';
import AppointmentCalendar from '../components/Calendar/AppointmentCalendar';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    status: '',
    search: ''
  });
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Preparar parâmetros de filtro
      const params = {};
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;
      if (filter.status) params.status = filter.status;
      if (filter.search) params.search = filter.search;
      
      const response = await appointmentService.getAppointments(params);
      setAppointments(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };
  
  const handleClearFilters = () => {
    setFilter({
      startDate: '',
      endDate: '',
      status: '',
      search: ''
    });
    // Buscar agendamentos sem filtros
    fetchAppointments();
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Mapear status para texto legível e cor
  const getStatusBadge = (status) => {
    const statuses = {
      'SCHEDULED': { text: 'Agendado', color: 'bg-blue-100 text-blue-800' },
      'CONFIRMED': { text: 'Confirmado', color: 'bg-green-100 text-green-800' },
      'CANCELED': { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
      'COMPLETED': { text: 'Concluído', color: 'bg-purple-100 text-purple-800' }
    };
    
    const statusInfo = statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };
  
  // Manipular clique em uma data no calendário
  const handleDateClick = (date, appointments) => {
    setSelectedDate(date);
    setSelectedAppointments(appointments);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os agendamentos de consultas e procedimentos
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${viewMode === 'list' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${viewMode === 'calendar' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Calendário
            </button>
          </div>
          <Link
            to="/appointments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Novo Agendamento
          </Link>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Data Inicial
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={filter.startDate}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  Data Final
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={filter.endDate}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
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
                    value={filter.status}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Todos</option>
                    <option value="SCHEDULED">Agendado</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="CANCELED">Cancelado</option>
                    <option value="COMPLETED">Concluído</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Buscar
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={filter.search}
                    onChange={handleFilterChange}
                    placeholder="Buscar por nome do paciente..."
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2 flex items-end space-x-3">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Filtrar
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Limpar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Visualização de agendamentos (Lista ou Calendário) */}
      {viewMode === 'list' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : appointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <li key={appointment.id}>
                  <Link to={`/appointments/${appointment.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {appointment.patient?.name || 'Paciente não encontrado'}
                            </p>
                            <div className="flex mt-1">
                              <p className="text-sm text-gray-500 truncate">
                                {formatDate(appointment.scheduledDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusBadge(appointment.status)}
                          <p className="mt-1 text-sm text-gray-500">{appointment.type || 'Consulta'}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agendamento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(filter).some(v => v) ? 'Tente uma busca diferente ou crie um novo agendamento.' : 'Comece criando seu primeiro agendamento.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/appointments/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Novo Agendamento
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <AppointmentCalendar 
                appointments={appointments} 
                onDateClick={handleDateClick} 
              />
              
              {selectedDate && selectedAppointments.length > 0 && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Agendamentos para {selectedDate.toLocaleDateString('pt-BR')}
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {selectedAppointments.map((appointment) => (
                      <li key={appointment.id}>
                        <Link to={`/appointments/${appointment.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-primary-600 truncate">
                                    {appointment.patient?.name || 'Paciente não encontrado'}
                                  </p>
                                  <div className="flex mt-1">
                                    <p className="text-sm text-gray-500 truncate">
                                      {formatDate(appointment.scheduledDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                {getStatusBadge(appointment.status)}
                                <p className="mt-1 text-sm text-gray-500">{appointment.type || 'Consulta'}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <Link
          to="/public/booking"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          target="_blank"
        >
          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Acessar Página de Agendamento Pública
        </Link>
      </div>
    </div>
  );
};

export default AppointmentsPage;