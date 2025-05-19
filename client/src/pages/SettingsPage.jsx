// client/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { organizationService, userService } from '../services/api';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [activeTab, setActiveTab] = useState('organization');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados da organização
        const orgData = await organizationService.getCurrentOrganization();
        setOrganization(orgData);
        
        // Se for admin, buscar usuários
        if (isAdmin()) {
          const usersData = await organizationService.getOrganizationUsers();
          setUsers(usersData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Erro ao carregar configurações');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAdmin()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">
            Apenas administradores podem acessar as configurações do sistema.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie as configurações do sistema e usuários
        </p>
      </div>
      
      {/* Abas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('organization')}
            className={`${
              activeTab === 'organization'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Organização
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Usuários
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das abas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Organização */}
        {activeTab === 'organization' && organization && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informações da Organização</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                <p className="mt-1 text-sm text-gray-900">{organization.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {organization.subscription && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Assinatura</h3>
                  <div className="mt-1 bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Plano</h4>
                        <p className="text-sm text-gray-900">{organization.subscription.plan}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Status</h4>
                        <p className="text-sm text-gray-900">{organization.subscription.status}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Validade</h4>
                        <p className="text-sm text-gray-900">
                          {organization.subscription.expiresAt 
                            ? new Date(organization.subscription.expiresAt).toLocaleDateString('pt-BR')
                            : 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {organization.settings && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Configurações</h3>
                  <div className="mt-1 bg-gray-50 p-4 rounded-md">
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {JSON.stringify(organization.settings, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                Editar Informações
              </button>
            </div>
          </div>
        )}
        
        {/* Usuários */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Usuários</h2>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => toast.info('Funcionalidade em desenvolvimento')}
              >
                <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Usuário
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-lg">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'PROFESSIONAL' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'ADMIN' ? 'Administrador' :
                           user.role === 'PROFESSIONAL' ? 'Profissional' :
                           'Recepcionista'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;