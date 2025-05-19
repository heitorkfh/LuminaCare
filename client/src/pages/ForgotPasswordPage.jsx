// client/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, informe seu email');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulação de envio de email de recuperação
      // Em uma implementação real, isso chamaria uma API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast.success('Instruções de recuperação enviadas para seu email');
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      toast.error('Erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-primary-600">LuminaCare</h1>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifique seu email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enviamos instruções para recuperar sua senha para {email}
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-primary-600">LuminaCare</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Informe seu email e enviaremos instruções para recuperar sua senha
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-primary-500 group-hover:text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;