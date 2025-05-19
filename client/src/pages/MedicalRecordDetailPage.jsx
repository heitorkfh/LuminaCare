// client/src/pages/MedicalRecordDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { medicalRecordService, authService } from '../services/api';
import { toast } from 'react-toastify';
import MedicalRecordDetail from '../components/MedicalRecord/MedicalRecordDetail';

const MedicalRecordDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await medicalRecordService.getRecord(id);
        setRecord(data);
        
        // Verificar se o usuário pode editar o prontuário
        const currentUser = authService.getCurrentUser();
        const isAdmin = currentUser?.role === 'ADMIN';
        const isOwner = currentUser?.id === data.professionalId;
        const isDraft = data.status === 'DRAFT';
        
        setCanEdit(isAdmin || (isOwner && isDraft));
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar prontuário:', error);
        toast.error('Erro ao carregar dados do prontuário');
        setLoading(false);
        navigate('/medical-records');
      }
    };
    
    if (id) {
      fetchRecord();
    }
  }, [id, navigate]);
  
  const handleRecordUpdate = (updatedRecord) => {
    setRecord(updatedRecord);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!record) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Prontuário não encontrado</h2>
          <Link
            to="/medical-records"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Voltar para lista de prontuários
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Prontuário Médico
            </h1>
            {record.patient && (
              <p className="mt-1 text-sm text-gray-500">
                Paciente: {record.patient.name}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Data: {new Date(record.recordDate).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar
            </button>
            
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Imprimir
            </button>
            
            {canEdit && (
              <Link
                to={`/medical-records/edit/${record.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Editar
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Conteúdo do prontuário */}
      <div className="print:mt-0">
        <MedicalRecordDetail 
          record={record} 
          onUpdate={handleRecordUpdate}
          canEdit={canEdit}
        />
      </div>
      
      {/* Navegação para o paciente */}
      {record.patientId && (
        <div className="mt-6 print:hidden">
          <Link
            to={`/patients/${record.patientId}/medical-records`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            Ver todos os prontuários do paciente
          </Link>
        </div>
      )}
      
      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
            color: #000;
            background-color: #fff;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:mt-0 {
            margin-top: 0 !important;
          }
          
          .shadow-md {
            box-shadow: none !important;
          }
          
          .rounded-lg {
            border-radius: 0 !important;
          }
          
          @page {
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
};

export default MedicalRecordDetailPage;