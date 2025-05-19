// client/src/pages/RegistrationsPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegistrationsPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('services');
  
  // Verificar se um link está ativo
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Navegar para a página correspondente quando uma aba é selecionada
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'services':
        navigate('/registrations/services');
        break;
      case 'professionals':
        navigate('/registrations/professionals');
        break;
      case 'patients':
        navigate('/registrations/patients');
        break;
      case 'medications':
        navigate('/registrations/medications');
        break;
      case 'insurances':
        navigate('/registrations/insurances');
        break;
      default:
        navigate('/registrations/services');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Cadastros
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os cadastros do sistema
            </p>
          </div>
        </div>
      </div>
      
      {/* Abas de navegação */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('services')}
            className={`${activeTab === 'services' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Serviços
          </button>
          
          <button
            onClick={() => handleTabChange('professionals')}
            className={`${activeTab === 'professionals' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profissionais
          </button>
          
          <button
            onClick={() => handleTabChange('patients')}
            className={`${activeTab === 'patients' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pacientes
          </button>
          
          <button
            onClick={() => handleTabChange('medications')}
            className={`${activeTab === 'medications' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Medicamentos
          </button>
          
          <button
            onClick={() => handleTabChange('insurances')}
            className={`${activeTab === 'insurances' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Convênios
          </button>
        </nav>
      </div>
      
      {/* Conteúdo da página */}
      <div className="mt-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-10">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione uma categoria de cadastro</h3>
              <p className="mt-1 text-sm text-gray-500">
                Escolha uma das opções acima para gerenciar os cadastros correspondentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationsPage;