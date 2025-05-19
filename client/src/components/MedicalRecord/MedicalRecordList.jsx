// client/src/components/MedicalRecord/MedicalRecordList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { medicalRecordService } from '../../services/api';
import { toast } from 'react-toastify';

const MedicalRecordList = ({ patientId, limit = 10, showAddButton = true, onSelectRecord = null }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const data = await medicalRecordService.getPatientRecords(patientId);
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar prontuários:', error);
        toast.error('Erro ao carregar prontuários');
        setLoading(false);
      }
    };
    
    if (patientId) {
      fetchRecords();
    }
  }, [patientId]);
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  // Mapear tipo de registro para texto legível
  const getRecordTypeText = (type) => {
    const types = {
      'CONSULTATION': 'Consulta',
      'EXAM': 'Exame',
      'PROCEDURE': 'Procedimento',
      'NOTE': 'Anotação',
      'INITIAL_ASSESSMENT': 'Avaliação Inicial'
    };
    return types[type] || type;
  };
  
  // Mapear status para texto legível e cor
  const getStatusBadge = (status) => {
    const statuses = {
      'DRAFT': { text: 'Rascunho', color: 'bg-yellow-100 text-yellow-800' },
      'SIGNED': { text: 'Assinado', color: 'bg-green-100 text-green-800' },
      'AMENDED': { text: 'Emendado', color: 'bg-blue-100 text-blue-800' }
    };
    
    const statusInfo = statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };
  
  // Lidar com clique no registro
  const handleRecordClick = (record) => {
    if (onSelectRecord) {
      onSelectRecord(record);
    } else {
      navigate(`/medical-records/${record.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (records.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum prontuário encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há prontuários registrados para este paciente.
          </p>
          {showAddButton && (
            <div className="mt-6">
              <Link
                to={`/medical-records/new?patientId=${patientId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Criar Prontuário
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Limitar o número de registros exibidos se necessário
  const displayedRecords = limit ? records.slice(0, limit) : records;
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Prontuários Médicos</h2>
        {showAddButton && (
          <Link
            to={`/medical-records/new?patientId=${patientId}`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Novo Prontuário
          </Link>
        )}
      </div>
      
      <ul className="divide-y divide-gray-200">
        {displayedRecords.map((record) => (
          <li 
            key={record.id} 
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => handleRecordClick(record)}
          >
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {record.recordType === 'CONSULTATION' ? (
                      <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : record.recordType === 'EXAM' ? (
                      <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getRecordTypeText(record.recordType)}
                      {record.chiefComplaint && ` - ${record.chiefComplaint.substring(0, 50)}${record.chiefComplaint.length > 50 ? '...' : ''}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(record.recordDate)}
                      {record.professional && ` • Dr(a). ${record.professional.name}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(record.status)}
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {record.diagnosis && record.diagnosis.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {record.diagnosis.map((diag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {diag.description}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      {limit && records.length > limit && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Link
            to={`/patients/${patientId}/medical-records`}
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Ver todos os prontuários ({records.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordList;