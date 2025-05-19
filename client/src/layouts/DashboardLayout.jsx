// client/src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { currentUser, logout, isAdmin, isProfessional, isReceptionist } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Verificar se um link está ativo
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar para mobile */}
      <div className={`md:hidden fixed inset-0 flex z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Fechar sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Logo e menu mobile */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-white">LuminaCare</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {/* Links de navegação */}
              <Link
                to="/dashboard"
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive('/dashboard') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                }`}
              >
                <svg className="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              
              {/* Menu de Cadastros com subitens */}
              <div className="space-y-1">
                <Link
                  to="/registrations"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive('/registrations') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                  }`}
                >
                  <svg className="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Cadastros
                </Link>
                
                {/* Subitens de Cadastros */}
                <div className="pl-10 space-y-1">
                  <Link
                    to="/registrations/services"
                    className={`group flex items-center px-2 py-1 text-base font-medium rounded-md ${
                      isActive('/registrations/services') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    Serviços
                  </Link>
                  
                  <Link
                    to="/registrations/professionals"
                    className={`group flex items-center px-2 py-1 text-base font-medium rounded-md ${
                      isActive('/registrations/professionals') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    Profissionais
                  </Link>
                  
                  <Link
                    to="/registrations/patients"
                    className={`group flex items-center px-2 py-1 text-base font-medium rounded-md ${
                      isActive('/registrations/patients') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    Pacientes
                  </Link>
                  
                  <Link
                    to="/registrations/medications"
                    className={`group flex items-center px-2 py-1 text-base font-medium rounded-md ${
                      isActive('/registrations/medications') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    Medicamentos
                  </Link>
                  
                  <Link
                    to="/registrations/insurances"
                    className={`group flex items-center px-2 py-1 text-base font-medium rounded-md ${
                      isActive('/registrations/insurances') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    Convênios
                  </Link>
                </div>
              </div>
              
              <Link
                to="/appointments"
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive('/appointments') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                }`}
              >
                <svg className="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendamentos
              </Link>
              
              {(isProfessional() || isAdmin()) && (
                <Link
                  to="/medical-records"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive('/medical-records') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                  }`}
                >
                  <svg className="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Prontuários
                </Link>
              )}
              
              {isAdmin() && (
                <Link
                  to="/settings"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive('/settings') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                  }`}
                >
                  <svg className="mr-4 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </Link>
              )}
            </nav>
          </div>
          
          {/* Perfil do usuário mobile */}
          <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">
                    {currentUser?.name || 'Usuário'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-primary-300 hover:text-white"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-primary-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-2xl font-bold text-white">LuminaCare</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {/* Links de navegação */}
                <Link
                  to="/dashboard"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/dashboard') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                  }`}
                >
                  <svg className="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                
                {/* Menu de Cadastros com subitens */}
                <div className="space-y-1">
                  <Link
                    to="/registrations"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/registrations') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    <svg className="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Cadastros
                  </Link>
                  
                  {/* Subitens de Cadastros */}
                  <div className="pl-10 space-y-1">
                    <Link
                      to="/registrations/services"
                      className={`group flex items-center px-2 py-1 text-sm font-medium rounded-md ${
                        isActive('/registrations/services') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                      }`}
                    >
                      Serviços
                    </Link>
                    
                    <Link
                      to="/registrations/professionals"
                      className={`group flex items-center px-2 py-1 text-sm font-medium rounded-md ${
                        isActive('/registrations/professionals') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                      }`}
                    >
                      Profissionais
                    </Link>
                    
                    <Link
                      to="/registrations/patients"
                      className={`group flex items-center px-2 py-1 text-sm font-medium rounded-md ${
                        isActive('/registrations/patients') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                      }`}
                    >
                      Pacientes
                    </Link>
                    
                    <Link
                      to="/registrations/medications"
                      className={`group flex items-center px-2 py-1 text-sm font-medium rounded-md ${
                        isActive('/registrations/medications') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                      }`}
                    >
                      Medicamentos
                    </Link>
                    
                    <Link
                      to="/registrations/insurances"
                      className={`group flex items-center px-2 py-1 text-sm font-medium rounded-md ${
                        isActive('/registrations/insurances') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                      }`}
                    >
                      Convênios
                    </Link>
                  </div>
                </div>
                
                <Link
                  to="/appointments"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/appointments') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                  }`}
                >
                  <svg className="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendamentos
                </Link>
                
                {(isProfessional() || isAdmin()) && (
                  <Link
                    to="/medical-records"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/medical-records') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    <svg className="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Prontuários
                  </Link>
                )}
                
                {isAdmin() && (
                  <Link
                    to="/settings"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/settings') ? 'bg-primary-900 text-white' : 'text-white hover:bg-primary-700'
                    }`}
                  >
                    <svg className="mr-3 h-6 w-6 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configurações
                  </Link>
                )}
              </nav>
            </div>
            
            {/* Perfil do usuário desktop */}
            <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {currentUser?.name || 'Usuário'}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="text-xs font-medium text-primary-300 hover:text-white"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Barra superior */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Conteúdo da página */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;