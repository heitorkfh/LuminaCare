// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

// Criar o contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const user = authService.getCurrentUser();
      
      if (user && authService.isAuthenticated()) {
        try {
          // Verificar se o token ainda é válido
          const profile = await authService.getProfile();
          setCurrentUser(profile);
          console.log("Usuário autenticado:", user);
        } catch (error) {
          // Se o token for inválido, fazer logout
          console.error("Erro ao verificar token ou obter perfil:", error);
          authService.logout();
          setCurrentUser(null);
          console.log("Usuário não autenticado devido a erro no token/perfil.");
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Função de login
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Função de registro
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao registrar';
      toast.error(errorMessage);
      throw error;
    }
  };
  
  // Função de logout
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };
  
  // Verificar se o usuário tem uma determinada função
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };
  
  // Verificar se o usuário é admin
  const isAdmin = () => {
    return hasRole('ADMIN');
  };
  
  // Verificar se o usuário é profissional
  const isProfessional = () => {
    return hasRole('PROFESSIONAL');
  };
  
  // Verificar se o usuário é recepcionista
  const isReceptionist = () => {
    return hasRole('RECEPTIONIST');
  };
  
  // Valores do contexto
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isProfessional,
    isReceptionist
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Componente para proteger rotas
export const RequireAuth = ({ children }) => {
  const auth = useAuth(); // Atribuir a uma variável primeiro
  const location = useLocation();

  // Adicionar uma verificação explícita para auth sendo null
  if (auth === null) {
    // Isso indica que o contexto não foi encontrado, o que é a raiz do erro.
    // Logar um erro mais específico ou retornar um fallback diferente.
    console.error("AuthContext: useAuth() returned null in RequireAuth. Ensure AuthProvider is an ancestor and working correctly.");
    // Pode-se retornar um loader ou uma mensagem de erro aqui para evitar o crash.
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Erro de configuração de autenticação. Verifique o console.</p>
      </div>
    );
  }

  const { currentUser, loading } = auth; // Agora desestruturar com segurança

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    // Redirecionar para a página de login, salvando a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Componente para redirecionar usuários autenticados
export const RedirectIfAuthenticated = ({ children }) => {
  const auth = useAuth(); // Atribuir a uma variável primeiro
  const location = useLocation();

  // Adicionar uma verificação explícita para auth sendo null
  if (auth === null) {
    console.error("AuthContext: useAuth() returned null in RedirectIfAuthenticated. Ensure AuthProvider is an ancestor and working correctly.");
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Erro de configuração de autenticação. Verifique o console.</p>
      </div>
    );
  }

  const { currentUser, loading } = auth; // Agora desestruturar com segurança

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (currentUser) {
    // Redirecionar para a página inicial ou para a página que o usuário tentou acessar
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  return children;
};

export default AuthContext;