// client/src/pages/PublicBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format, parseISO, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { publicBookingService } from '../services/publicBookingService';

const PublicBookingPage = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Selecionar serviço, 2: Selecionar profissional, 3: Selecionar data/hora, 4: Informações do paciente, 5: Confirmação
  
  // Formulário do paciente
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    notes: ''
  });
  
  // Carregar serviços ao iniciar
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Em um ambiente de produção, isso usaria a API real
        // const response = await publicBookingService.getAvailableServices();
        // setServices(response.data || []);
        
        // Por enquanto, vamos simular com dados estáticos para desenvolvimento
        const mockServices = [
          { id: '1', name: 'Consulta Médica', description: 'Consulta médica geral' },
          { id: '2', name: 'Exame de Rotina', description: 'Exames laboratoriais de rotina' },
          { id: '3', name: 'Fisioterapia', description: 'Sessão de fisioterapia' },
          { id: '4', name: 'Nutrição', description: 'Consulta com nutricionista' },
          { id: '5', name: 'Psicologia', description: 'Consulta com psicólogo' }
        ];
        
        setServices(mockServices);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        toast.error('Erro ao carregar serviços disponíveis');
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  // Carregar profissionais quando um serviço é selecionado
  useEffect(() => {
    const fetchProfessionals = async () => {
      if (!selectedService) return;
      
      try {
        setLoading(true);
        // Em um ambiente de produção, isso usaria a API real
        // const response = await publicBookingService.getAvailableProfessionalsByService(selectedService);
        // setProfessionals(response.data || []);
        
        // Por enquanto, vamos simular com dados estáticos para desenvolvimento
        const mockProfessionals = [
          { id: '1', name: 'Dr. João Silva', specialty: 'Clínico Geral' },
          { id: '2', name: 'Dra. Maria Oliveira', specialty: 'Pediatria' },
          { id: '3', name: 'Dr. Carlos Santos', specialty: 'Cardiologia' }
        ];
        
        setProfessionals(mockProfessionals);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        toast.error('Erro ao carregar profissionais disponíveis');
        setLoading(false);
      }
    };
    
    fetchProfessionals();
  }, [selectedService]);
  
  // Carregar horários disponíveis quando o profissional e a data são selecionados
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedProfessional || !selectedDate) return;
      
      try {
        setLoading(true);
        // Em um ambiente de produção, isso usaria a API real
        // const response = await publicBookingService.getAvailableSlots(
        //   selectedProfessional, 
        //   selectedDate.toISOString()
        // );
        // setAvailableSlots(response.data || []);
        
        // Simulando horários disponíveis para desenvolvimento
        const mockTimeSlots = [];
        const startHour = 8;
        const endHour = 17;
        const date = new Date(selectedDate);
        
        // Gerar horários a cada 30 minutos
        for (let hour = startHour; hour <= endHour; hour++) {
          for (let minute of [0, 30]) {
            // Pular horário de almoço (12:00 - 13:30)
            if (hour === 12 && minute === 0) continue;
            if (hour === 12 && minute === 30) continue;
            if (hour === 13 && minute === 0) continue;
            
            date.setHours(hour, minute, 0);
            
            // Simular alguns horários já ocupados
            const isBooked = Math.random() > 0.7;
            
            if (!isBooked) {
              mockTimeSlots.push({
                time: format(date, 'HH:mm'),
                dateTime: new Date(date).toISOString(),
                available: true
              });
            }
          }
        }
        
        setAvailableSlots(mockTimeSlots);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error);
        toast.error('Erro ao carregar horários disponíveis');
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [selectedProfessional, selectedDate]);
  
  // Manipular mudança no formulário do paciente
  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Avançar para o próximo passo
  const handleNextStep = () => {
    // Validações básicas
    if (bookingStep === 1 && !selectedService) {
      toast.error('Por favor, selecione um serviço');
      return;
    }
    
    if (bookingStep === 2 && !selectedProfessional) {
      toast.error('Por favor, selecione um profissional');
      return;
    }
    
    if (bookingStep === 3 && !selectedSlot) {
      toast.error('Por favor, selecione um horário');
      return;
    }
    
    if (bookingStep === 4) {
      // Validar formulário do paciente
      if (!patientForm.name || !patientForm.email || !patientForm.phone) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientForm.email)) {
        toast.error('Por favor, informe um email válido');
        return;
      }
    }
    
    setBookingStep(prev => prev + 1);
  };
  
  // Voltar para o passo anterior
  const handlePreviousStep = () => {
    setBookingStep(prev => prev - 1);
  };
  
  // Finalizar agendamento
  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      
      // Em um ambiente de produção, isso usaria a API real
      const appointmentData = {
        serviceId: selectedService,
        professionalId: selectedProfessional,
        scheduledDate: selectedSlot.dateTime,
        patientInfo: patientForm,
        status: 'SCHEDULED',
        type: services.find(s => s.id === selectedService)?.name || 'Consulta'
      };
      
      // Em produção, descomentar esta linha e remover a simulação abaixo
      // const response = await publicBookingService.createPublicAppointment(appointmentData);
      
      // Simular um atraso para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Agendamento realizado com sucesso! Você receberá um email com a confirmação.');
      setLoading(false);
      
      // Resetar o formulário e voltar para o passo 1
      setSelectedService('');
      setSelectedProfessional('');
      setSelectedDate(new Date());
      setSelectedSlot(null);
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        notes: ''
      });
      setBookingStep(1);
    } catch (error) {
      console.error('Erro ao realizar agendamento:', error);
      toast.error('Erro ao realizar agendamento');
      setLoading(false);
    }
  };
  
  // Gerar dias para seleção
  const generateDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    
    return days;
  };
  
  // Renderizar o passo atual
  const renderStep = () => {
    switch (bookingStep) {
      case 1: // Selecionar serviço
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Selecione o serviço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedService === service.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">{service.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Próximo
              </button>
            </div>
          </div>
        );
        
      case 2: // Selecionar profissional
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Selecione o profissional</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.map(professional => (
                <div 
                  key={professional.id}
                  onClick={() => setSelectedProfessional(professional.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedProfessional === professional.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium">{professional.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{professional.name}</h3>
                      <p className="text-sm text-gray-500">{professional.specialty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Próximo
              </button>
            </div>
          </div>
        );
        
      case 3: // Selecionar data e hora
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Selecione a data e horário</h2>
            
            {/* Seleção de data */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Data</h3>
              <div className="flex overflow-x-auto pb-2 space-x-2">
                {generateDays().map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center p-3 border rounded-md min-w-[80px]
                      ${isSameDay(day, selectedDate) ? 'bg-primary-50 border-primary-500' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="text-xs font-medium text-gray-500">
                      {format(day, 'EEE', { locale: ptBR })}
                    </span>
                    <span className={`text-lg font-semibold ${isSameDay(day, selectedDate) ? 'text-primary-600' : 'text-gray-900'}`}>
                      {format(day, 'dd')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(day, 'MMM', { locale: ptBR })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Seleção de horário */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Horário</h3>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 border rounded-md text-center
                        ${selectedSlot && selectedSlot.time === slot.time ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum horário disponível para esta data.</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Próximo
              </button>
            </div>
          </div>
        );
        
      case 4: // Informações do paciente
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Suas informações</h2>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={patientForm.name}
                  onChange={handlePatientFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={patientForm.email}
                  onChange={handlePatientFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={patientForm.phone}
                  onChange={handlePatientFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Data de nascimento</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={patientForm.dateOfBirth}
                  onChange={handlePatientFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={patientForm.notes}
                  onChange={handlePatientFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Informe qualquer detalhe importante para o profissional"
                ></textarea>
              </div>
            </form>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Revisar e confirmar
              </button>
            </div>
          </div>
        );
        
      case 5: // Confirmação
        const service = services.find(s => s.id === selectedService);
        const professional = professionals.find(p => p.id === selectedProfessional);
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Confirmar agendamento</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Serviço</h3>
                  <p className="mt-1 text-sm text-gray-900">{service?.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Profissional</h3>
                  <p className="mt-1 text-sm text-gray-900">{professional?.name} - {professional?.specialty}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data e horário</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedSlot?.time}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Paciente</h3>
                  <p className="mt-1 text-sm text-gray-900">{patientForm.name}</p>
                  <p className="text-sm text-gray-500">{patientForm.email}</p>
                  <p className="text-sm text-gray-500">{patientForm.phone}</p>
                </div>
                
                {patientForm.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                    <p className="mt-1 text-sm text-gray-900">{patientForm.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleBookAppointment}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : 'Confirmar agendamento'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">LuminaCare</h1>
            <span className="ml-2 text-sm text-gray-500">Agendamento online</span>
          </div>
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">Área restrita</a>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Indicador de progresso */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <React.Fragment key={step}>
                    <div 
                      className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium
                        ${bookingStep >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div 
                        className={`flex-grow h-0.5 ${bookingStep > step ? 'bg-primary-600' : 'bg-gray-200'}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Profissional</span>
                <span>Data/Hora</span>
                <span>Seus dados</span>
                <span>Confirmação</span>
              </div>
            </div>
            
            {/* Conteúdo do passo atual */}
            <div className="px-4 py-5 sm:p-6">
              {loading && bookingStep !== 4 ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                renderStep()
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Rodapé */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} LuminaCare. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicBookingPage;