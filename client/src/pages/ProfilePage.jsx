// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Estado para formulário de perfil
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  
  // Estado para formulário de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        if (currentUser) {
          const userData = await userService.getUser(currentUser.id);
          setUserProfile(userData);
          setProfileForm({
            name: userData.name,
            email: userData.email
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Erro ao carregar dados do perfil');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  // Lidar com mudanças no formulário de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Lidar com mudanças no formulário de senha
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Enviar formulário de perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileForm.name || !profileForm.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    try {
      setSaving(true);
      
      await userService.updateUser(currentUser.id, profileForm);
      
      toast.success('Perfil atualizado com sucesso');
      setSaving(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
      setSaving(false);
    }
  };
  
  // Enviar formulário de senha
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      await userService.changePassword(currentUser.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      toast.success('Senha alterada com sucesso');
      setChangingPassword(false);
      
      // Limpar formulário
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Verifique se a senha atual está correta.');
      setChangingPassword(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Perfil não encontrado</h2>
          <p className="text-gray-600">
            Não foi possível carregar os dados do seu perfil.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie suas informações pessoais e senha
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Informações do Perfil */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informações Pessoais</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Seus dados básicos</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Função
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="role"
                      value={userProfile.role === 'ADMIN' ? 'Administrador' : 
                             userProfile.role === 'PROFESSIONAL' ? 'Profissional' : 
                             'Recepcionista'}
                      disabled
                      className="shadow-sm bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
                    Membro desde
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="createdAt"
                      value={new Date(userProfile.createdAt).toLocaleDateString('pt-BR')}
                      disabled
                      className="shadow-sm bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Alterar Senha */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Alterar Senha</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Atualize sua senha de acesso</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Senha Atual
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Alterando...
                      </>
                    ) : (
                      'Alterar Senha'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;