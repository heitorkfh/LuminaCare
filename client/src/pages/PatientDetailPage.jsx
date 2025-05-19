// client/src/pages/PatientDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientService } from '../services/api';
import { toast } from 'react-toastify';
import MedicalRecordList from '../components/MedicalRecord/MedicalRecordList';

const PatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  
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
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Calcular idade
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
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
              {patient.name}
            </h1>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatDate(patient.dateOfBirth)}
                {patient.dateOfBirth && ` (${calculateAge(patient.dateOfBirth)} anos)`}
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
              to={`/patients/${patientId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar
            </Link>
            <Link
              to={`/appointments/new?patientId=${patientId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Novo Agendamento
            </Link>
          </div>
        </div>
      </div>
      
      {/* Abas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Informações Pessoais
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`${
              activeTab === 'medical'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Informações Médicas
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`${
              activeTab === 'records'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Prontuários
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`${
              activeTab === 'appointments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Agendamentos
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das abas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Informações Pessoais */}
        {activeTab === 'info' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome Completo</h3>
                <p className="mt-1 text-sm text-gray-900">{patient.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Nascimento</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(patient.dateOfBirth)}
                  {patient.dateOfBirth && ` (${calculateAge(patient.dateOfBirth)} anos)`}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gênero</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {patient.gender === 'male' ? 'Masculino' : 
                   patient.gender === 'female' ? 'Feminino' : 
                   patient.gender === 'other' ? 'Outro' : 'Não informado'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">CPF</h3>
                <p className="mt-1 text-sm text-gray-900">{patient.cpf || 'Não informado'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">RG</h3>
                <p className="mt-1 text-sm text-gray-900">{patient.rg || 'Não informado'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{patient.email || 'Não informado'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
            
            {patient.address && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Endereço</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Logradouro</h4>
                      <p className="text-sm text-gray-900">{patient.address.street || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Número</h4>
                      <p className="text-sm text-gray-900">{patient.address.number || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Complemento</h4>
                      <p className="text-sm text-gray-900">{patient.address.complement || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Bairro</h4>
                      <p className="text-sm text-gray-900">{patient.address.neighborhood || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Cidade</h4>
                      <p className="text-sm text-gray-900">{patient.address.city || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Estado</h4>
                      <p className="text-sm text-gray-900">{patient.address.state || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">CEP</h4>
                      <p className="text-sm text-gray-900">{patient.address.zipCode || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">País</h4>
                      <p className="text-sm text-gray-900">{patient.address.country || 'Brasil'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {patient.emergencyContact && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contato de Emergência</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Nome</h4>
                      <p className="text-sm text-gray-900">{patient.emergencyContact.name || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Telefone</h4>
                      <p className="text-sm text-gray-900">{patient.emergencyContact.phone || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Relação</h4>
                      <p className="text-sm text-gray-900">{patient.emergencyContact.relationship || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Informações Médicas */}
        {activeTab === 'medical' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Médicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patient.medicalInfo?.bloodType && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tipo Sanguíneo</h3>
                  <p className="mt-1 text-sm text-gray-900">{patient.medicalInfo.bloodType}</p>
                </div>
              )}
            </div>
            
            {patient.medicalInfo?.allergies && patient.medicalInfo.allergies.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Alergias</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {patient.medicalInfo.allergies.map((allergy, index) => (
                      <li key={index} className="text-sm text-gray-900">{allergy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {patient.medicalInfo?.chronicConditions && patient.medicalInfo.chronicConditions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Condições Crônicas</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {patient.medicalInfo.chronicConditions.map((condition, index) => (
                      <li key={index} className="text-sm text-gray-900">{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {patient.medicalInfo?.medications && patient.medicalInfo.medications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Medicamentos em Uso</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicamento</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosagem</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Término</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patient.medicalInfo.medications.map((medication, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{medication.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{medication.dosage}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{medication.frequency}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{medication.startDate ? formatDate(medication.startDate) : '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{medication.endDate ? formatDate(medication.endDate) : 'Em uso'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {patient.insuranceInfo && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações do Convênio</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Convênio</h4>
                      <p className="text-sm text-gray-900">{patient.insuranceInfo.provider || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Número da Carteirinha</h4>
                      <p className="text-sm text-gray-900">{patient.insuranceInfo.policyNumber || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Validade</h4>
                      <p className="text-sm text-gray-900">
                        {patient.insuranceInfo.expiryDate ? formatDate(patient.insuranceInfo.expiryDate) : 'Não informado'}
                      </p>
                    </div>
                    
                    {patient.insuranceInfo.planType && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Tipo de Plano</h4>
                        <p className="text-sm text-gray-900">{patient.insuranceInfo.planType}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Prontuários */}
        {activeTab === 'records' && (
          <div className="p-6">
            <MedicalRecordList patientId={patientId} limit={0} />
          </div>
        )}
        
        {/* Agendamentos */}
        {activeTab === 'appointments' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Agendamentos</h2>
              <Link
                to={`/appointments/new?patientId=${patientId}`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Agendamento
              </Link>
            </div>
            
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Componente de agendamentos será implementado em breve</h3>
              <p className="mt-1 text-sm text-gray-500">
                Esta funcionalidade está em desenvolvimento.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetailPage;