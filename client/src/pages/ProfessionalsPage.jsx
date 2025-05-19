// client/src/pages/ProfessionalsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfessionalsPage = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    crm: '',
    phone: '',
    email: '',
    active: true
  });
  const [editingId, setEditingId] = useState(null);

  // Carregar profissionais
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        // Em um ambiente de produção, isso usaria a API real
        // const response = await api.getProfessionals();
        // setProfessionals(response.data || []);
        
        // Por enquanto, vamos simular com dados estáticos para desenvolvimento
        const mockProfessionals = [
          { id: '1', name: 'Dr. João Silva', specialty: 'Clínico Geral', crm: '12345-SP', phone: '(11) 98765-4321', email: 'joao.silva@exemplo.com', active: true },
          { id: '2', name: 'Dra. Maria Oliveira', specialty: 'Pediatria', crm: '54321-SP', phone: '(11) 91234-5678', email: 'maria.oliveira@exemplo.com', active: true },
          { id: '3', name: 'Dr. Carlos Santos', specialty: 'Cardiologia', crm: '67890-SP', phone: '(11) 99876-5432', email: 'carlos.santos@exemplo.com', active: true },
          { id: '4', name: 'Dra. Ana Ferreira', specialty: 'Dermatologia', crm: '09876-SP', phone: '(11) 95678-1234', email: 'ana.ferreira@exemplo.com', active: false },
          { id: '5', name: 'Dr. Paulo Mendes', specialty: 'Ortopedia', crm: '13579-SP', phone: '(11) 92468-1357', email: 'paulo.mendes@exemplo.com', active: true }
        ];
        
        setProfessionals(mockProfessionals);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar profissionais:', error);
        toast.error('Erro ao carregar profissionais');
        setLoading(false);
      }
    };
    
    fetchProfessionals();
  }, []);

  // Manipular mudança nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Abrir formulário para edição
  const handleEdit = (professional) => {
    setFormData({
      name: professional.name,
      specialty: professional.specialty,
      crm: professional.crm,
      phone: professional.phone,
      email: professional.email,
      active: professional.active
    });
    setEditingId(professional.id);
    setShowForm(true);
  };

  // Abrir formulário para novo profissional
  const handleNew = () => {
    setFormData({
      name: '',
      specialty: '',
      crm: '',
      phone: '',
      email: '',
      active: true
    });
    setEditingId(null);
    setShowForm(true);
  };

  // Cancelar edição/criação
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Salvar profissional
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.specialty || !formData.crm) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      
      // Em um ambiente de produção, isso usaria a API real
      if (editingId) {
        // Atualizar profissional existente
        // await api.updateProfessional(editingId, formData);
        
        // Simulação para desenvolvimento
        setProfessionals(prev => prev.map(professional => 
          professional.id === editingId ? { ...professional, ...formData } : professional
        ));
        
        toast.success('Profissional atualizado com sucesso');
      } else {
        // Criar novo profissional
        // const response = await api.createProfessional(formData);
        
        // Simulação para desenvolvimento
        const newProfessional = {
          id: Date.now().toString(),
          ...formData
        };
        
        setProfessionals(prev => [...prev, newProfessional]);
        
        toast.success('Profissional criado com sucesso');
      }
      
      setLoading(false);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast.error('Erro ao salvar profissional');
      setLoading(false);
    }
  };

  // Alternar status do profissional (ativar/desativar)
  const handleToggleStatus = async (id) => {
    try {
      const professional = professionals.find(p => p.id === id);
      if (!professional) return;
      
      // Em um ambiente de produção, isso usaria a API real
      // await api.updateProfessional(id, { active: !professional.active });
      
      // Simulação para desenvolvimento
      setProfessionals(prev => prev.map(p => 
        p.id === id ? { ...p, active: !p.active } : p
      ));
      
      toast.success(`Profissional ${professional.active ? 'desativado' : 'ativado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status do profissional:', error);
      toast.error('Erro ao alterar status do profissional');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Profissionais
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os profissionais da clínica
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/registrations"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar
            </Link>
            <button
              type="button"
              onClick={handleNew}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Novo Profissional
            </button>
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingId ? 'Editar Profissional' : 'Novo Profissional'}
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                    Especialidade *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="specialty"
                      id="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="crm" className="block text-sm font-medium text-gray-700">
                    CRM/Registro Profissional *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="crm"
                      id="crm"
                      value={formData.crm}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
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
                      value={formData.email}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <div className="flex items-center h-full pt-5">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      checked={formData.active}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                      Ativo
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de profissionais */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Lista de Profissionais</h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">Nenhum profissional cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especialidade
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CRM/Registro
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {professionals.map((professional) => (
                    <tr key={professional.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {professional.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professional.specialty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {professional.crm}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{professional.phone}</div>
                        <div>{professional.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${professional.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {professional.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(professional)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(professional.id)}
                          className={`${professional.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {professional.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsPage;