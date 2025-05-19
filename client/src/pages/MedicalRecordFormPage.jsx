// client/src/pages/MedicalRecordFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { patientService, medicalRecordService, appointmentService } from '../services/api';
import { toast } from 'react-toastify';
import MedicalRecordForm from '../components/MedicalRecord/MedicalRecordForm';

const MedicalRecordFormPage = () => {
  const { id } = useParams(); // id do prontuário para edição
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState(null);
  
  // Obter patientId e appointmentId dos query params
  const patientId = queryParams.get('patientId');
  const appointmentId = queryParams.get('appointmentId');
  
  // Carregar dados do paciente
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      try {
        const data = await patientService.getPatient(patientId);
        setPatient(data);
      } catch (error) {
        console.error('Erro ao carregar paciente:', error);
        toast.error('Erro ao carregar dados do paciente');
      }
    };
    
    fetchPatient();
  }, [patientId]);
  
  // Carregar dados do agendamento
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      
      try {
        const data = await appointmentService.getAppointment(appointmentId);
        setAppointment(data);
        
        // Se o agendamento tiver um paciente e não tivermos um patientId nos query params
        if (data.patientId && !patientId) {
          const patientData = await patientService.getPatient(data.patientId);
          setPatient(patientData);
        }
      } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
        toast.error('Erro ao carregar dados do agendamento');
      }
    };
    
    fetchAppointment();
  }, [appointmentId, patientId]);
  
  // Verificar se estamos editando um prontuário existente
  useEffect(() => {
    const checkExistingRecord = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const record = await medicalRecordService.getRecord(id);
        
        // Carregar dados do paciente se ainda não temos
        if (!patient && record.patientId) {
          const patientData = await patientService.getPatient(record.patientId);
          setPatient(patientData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar prontuário:', error);
        toast.error('Erro ao carregar dados do prontuário');
        setLoading(false);
        navigate('/medical-records');
      }
    };
    
    checkExistingRecord();
  }, [id, navigate, patient]);
  
  // Verificar se temos as informações necessárias
  useEffect(() => {
    // Se estamos criando um novo prontuário e não temos um paciente
    if (!id && !patient && !loading) {
      toast.error('É necessário selecionar um paciente para criar um prontuário');
      navigate('/patients');
    }
  }, [id, patient, loading, navigate]);
  
  const handleSuccess = (record) => {
    // Se o prontuário foi criado a partir de um agendamento, atualizar o status do agendamento
    if (appointmentId && !id) {
      appointmentService.updateAppointment(appointmentId, { status: 'COMPLETED' })
        .catch(error => {
          console.error('Erro ao atualizar status do agendamento:', error);
        });
    }
    
    // Redirecionar para a página de detalhes do prontuário
    navigate(`/medical-records/${record.id}`);
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
      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {id ? 'Editar Prontuário' : 'Novo Prontuário'}
            </h1>
            {patient && (
              <p className="mt-1 text-sm text-gray-500">
                Paciente: {patient.name}
              </p>
            )}
            {appointment && (
              <p className="mt-1 text-sm text-gray-500">
                Agendamento: {new Date(appointment.scheduledDate).toLocaleString()} - {appointment.type}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
      
      {/* Formulário */}
      <MedicalRecordForm
        patientId={patient?.id}
        appointmentId={appointmentId}
        recordId={id}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default MedicalRecordFormPage;