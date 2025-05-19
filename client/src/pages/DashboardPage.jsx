// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { organizationService, appointmentService, patientService } from '../services/api';
import { toast } from 'react-toastify';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    medicalRecordsCount: 0,
    usersCount: 0,
    appointmentsByStatus: [],
    medicalRecordsByType: []
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar estatísticas da organização
        const orgStats = await organizationService.getOrganizationStats();
        setStats(orgStats);
        
        // Buscar próximos agendamentos
        const params = {
          startDate: new Date().toISOString(),
          limit: 10,
          status: 'SCHEDULED,CONFIRMED'
        };
        
        if (currentUser.role === 'PROFESSIONAL') {
          params.professionalId = currentUser.id;
        }
        
        const appointmentsResponse = await appointmentService.getAppointments(params);
        setUpcomingAppointments(appointmentsResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);
  
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
  
  // Obter dias da semana atual
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };

  // Obter horários do dia (7:00 às 18:00)
  const getTimeSlots = () => {
    const slots = [];
    for (let i = 7; i <= 18; i++) {
      slots.push(`${i}:00`);
    }
    return slots;
  };

  // Verificar se há agendamento em determinado horário e dia
  const getAppointmentForTimeSlot = (day, timeSlot) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    return upcomingAppointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.scheduledDate);
      return isSameDay(appointmentDate, day) && appointmentDate.getHours() === hour;
    });
  };

  // Navegar para o próximo período
  const nextPeriod = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  // Navegar para o período anterior
  const prevPeriod = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex">
        {/* Sidebar de próximos pacientes */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">PRÓXIMOS PACIENTES</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingAppointments.slice(0, 10).map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center">
                  {appointment.status === 'CONFIRMED' && (
                    <div className="flex-shrink-0 h-3 w-3 rounded-full bg-yellow-400 mr-2"></div>
                  )}
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(appointment.scheduledDate).split(' ')[1]} - {appointment.patient?.name || 'Paciente não encontrado'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Calendário de</span>
                  <div className="relative">
                    <select className="appearance-none bg-transparent pr-8 py-1 pl-2 border border-gray-300 rounded-md text-sm">
                      <option>Dra. Helena Oliveira</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Hoje
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Novo Agendamento
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <button onClick={prevPeriod} className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Dezembro 2022
                </h2>
                <button onClick={nextPeriod} className="p-2 rounded-full hover:bg-gray-100">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="flex border-b border-gray-200">
                <div className="w-20 flex-shrink-0"></div>
                {getWeekDays().map((day, index) => (
                  <div key={index} className="flex-1 text-center py-2 border-l border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {format(day, 'EEEE', { locale: ptBR })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(day, 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="divide-y divide-gray-200">
                {getTimeSlots().map((timeSlot, timeIndex) => (
                  <div key={timeIndex} className="flex">
                    <div className="w-20 py-4 px-2 text-right text-sm text-gray-500 border-r border-gray-200">
                      {timeSlot}
                    </div>
                    {getWeekDays().map((day, dayIndex) => {
                      const appointments = getAppointmentForTimeSlot(day, timeSlot);
                      return (
                        <div key={dayIndex} className="flex-1 border-l border-gray-200 p-1">
                          {appointments.map((appointment, appIndex) => (
                            <div 
                              key={appIndex} 
                              className={`text-xs p-1 rounded ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                            >
                              {appointment.patient?.name || 'Paciente'}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;