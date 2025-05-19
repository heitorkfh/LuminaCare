// client/src/pages/PatientMedicalRecordsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientService } from '../services/api';
import { toast } from 'react-toastify';
import MedicalRecordList from '../components/MedicalRecord/MedicalRecordList';
import MedicalRecordDetail from '../components/MedicalRecord/MedicalRecordDetail';

const PatientMedicalRecordsPage = () => {
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatient(patientId);
        setPatient(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar paciente:', error);
        toast.error('Erro ao carregar dados do paciente');
        setLoading(false);
        navigate('/patients');
      }
    };
    
    if (patientId) {
      fetchPatient();
    }
  }, [patientId, navigate]);
  
  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    // Scroll to top on mobile
    if (window.innerWidth < 768) {
      window.scrollTo(0, 0);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Paciente não encontrado</h2>
          <Link
            to="/patients"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Voltar para lista de pacientes
          </Link>
        </div>
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
              Prontuário de {patient.name}
            </h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {new Date(patient.dateOfBirth).toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {patient.phone}
              </div>
              {patient.email && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {patient.email}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Link
              to={`/patients/${patientId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Perfil do Paciente
            </Link>
            <Link
              to={`/medical-records/new?patientId=${patientId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Novo Prontuário
            </Link>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de prontuários */}
        <div className="md:col-span-1">
          <MedicalRecordList 
            patientId={patientId} 
            limit={0} 
            onSelectRecord={handleSelectRecord}
          />
        </div>
        
        {/* Detalhes do prontuário */}
        <div className="md:col-span-2">
          {selectedRecord ? (
            <MedicalRecordDetail 
              record={selectedRecord} 
              onUpdate={(updatedRecord) => setSelectedRecord(updatedRecord)}
              canEdit={true}
            />
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-64">
              <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione um prontuário</h3>
              <p className="mt-1 text-sm text-gray-500">
                Clique em um prontuário na lista para visualizar os detalhes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalRecordsPage;