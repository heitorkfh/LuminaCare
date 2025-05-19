// client/src/components/Calendar/AppointmentCalendar.jsx
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentCalendar = ({ appointments, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Dias da semana em português
  const weekDays = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'];
  
  // Navegar para o mês anterior
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navegar para o próximo mês
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Obter dias do mês atual
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  
  // Obter o dia da semana (0-6) para o primeiro dia do mês
  const getStartingDayOfMonth = () => {
    return getDay(startOfMonth(currentMonth));
  };
  
  // Verificar se um dia tem agendamentos
  const hasAppointmentsOnDay = (day) => {
    return appointments.some(appointment => {
      const appointmentDate = parseISO(appointment.scheduledDate);
      return isSameDay(appointmentDate, day);
    });
  };
  
  // Obter agendamentos para um dia específico
  const getAppointmentsForDay = (day) => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.scheduledDate);
      return isSameDay(appointmentDate, day);
    });
  };
  
  // Renderizar cabeçalho do calendário
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };
  
  // Renderizar dias da semana
  const renderDays = () => {
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  // Renderizar células do calendário
  const renderCells = () => {
    const monthDays = getDaysInMonth();
    const startingDayOfWeek = getStartingDayOfMonth();
    
    // Criar células vazias para os dias antes do início do mês
    const blanks = Array(startingDayOfWeek).fill(null).map((_, index) => (
      <div key={`blank-${index}`} className="h-24 border border-gray-200 bg-gray-50" />
    ));
    
    // Criar células para cada dia do mês
    const days = monthDays.map(day => {
      const dayAppointments = getAppointmentsForDay(day);
      const hasAppointments = dayAppointments.length > 0;
      const isSelected = isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      
      return (
        <div
          key={day.toString()}
          onClick={() => {
            setSelectedDate(day);
            if (onDateClick) onDateClick(day, dayAppointments);
          }}
          className={`h-24 border border-gray-200 p-1 overflow-hidden transition-colors cursor-pointer
            ${isSelected ? 'bg-primary-50 border-primary-500' : ''}
            ${isToday ? 'bg-blue-50' : ''}
            ${!isSelected && !isToday ? 'hover:bg-gray-50' : ''}
          `}
        >
          <div className="flex justify-between">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {format(day, 'd')}
            </span>
            {hasAppointments && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-600 bg-primary-100 rounded-full">
                {dayAppointments.length}
              </span>
            )}
          </div>
          
          {/* Mostrar até 2 agendamentos, com indicação de mais se houver */}
          <div className="mt-1 space-y-1 overflow-hidden">
            {dayAppointments.slice(0, 2).map((appointment, index) => (
              <div
                key={index}
                className="text-xs truncate px-1 py-0.5 rounded bg-primary-100 text-primary-800"
                title={`${appointment.patient?.name || 'Paciente'} - ${format(parseISO(appointment.scheduledDate), 'HH:mm')}`}
              >
                {format(parseISO(appointment.scheduledDate), 'HH:mm')} - {appointment.patient?.name || 'Paciente'}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-gray-500 pl-1">
                + {dayAppointments.length - 2} mais
              </div>
            )}
          </div>
        </div>
      );
    });
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {blanks}
        {days}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
};

export default AppointmentCalendar;