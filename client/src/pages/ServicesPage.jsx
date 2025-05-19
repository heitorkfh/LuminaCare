// client/src/pages/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceService } from '../services/serviceApi';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    active: true,
    categoryId: '',
    professionals: [],
    availabilities: []
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    categoryId: '',
    active: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Carregar categorias
        const categoriesResponse = await serviceService.getCategories();
        setCategories(categoriesResponse.data || []);
        
        // Carregar profissionais
        const professionalsResponse = await serviceService.getProfessionals();
        setProfessionals(professionalsResponse.data || []);
        
        // Carregar serviços
        await fetchServices();
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Erro ao carregar dados iniciais');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Função para buscar serviços com filtros
  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Preparar parâmetros de filtro
      const params = {
        ...filter,
        sortBy,
        sortOrder
      };
      
      const response = await serviceService.getServices(params);
      setServices(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços');
      setLoading(false);
    }
  };
  
  // Aplicar filtros
  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchServices();
  };
  
  // Limpar filtros
  const handleClearFilters = () => {
    setFilter({
      search: '',
      categoryId: '',
      active: ''
    });
    setSortBy('name');
    setSortOrder('asc');
    fetchServices();
  };

  // Manipular mudança nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Adicionar disponibilidade
  const handleAddAvailability = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [
        ...prev.availabilities,
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' }
      ]
    }));
  };
  
  // Atualizar disponibilidade
  const handleUpdateAvailability = (index, field, value) => {
    setFormData(prev => {
      const newAvailabilities = [...prev.availabilities];
      newAvailabilities[index] = {
        ...newAvailabilities[index],
        [field]: value
      };
      return {
        ...prev,
        availabilities: newAvailabilities
      };
    });
  };
  
  // Remover disponibilidade
  const handleRemoveAvailability = (index) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index)
    }));
  };
  
  // Obter nome do dia da semana
  const getDayName = (dayOfWeek) => {
    const days = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    return days[dayOfWeek] || '';
  };

  // Abrir formulário para edição
  const handleEdit = async (service) => {
    try {
      setLoading(true);
      
      // Buscar detalhes completos do serviço
      const response = await serviceService.getService(service.id);
      const serviceData = response.data;
      
      // Extrair profissionais associados
      const serviceProfessionals = serviceData.professionals?.map(sp => sp.professional.id) || [];
      
      setFormData({
        name: serviceData.name,
        description: serviceData.description,
        duration: serviceData.duration,
        price: serviceData.price,
        active: serviceData.active,
        categoryId: serviceData.categoryId || '',
        professionals: serviceProfessionals,
        availabilities: serviceData.availabilities || []
      });
      
      setEditingId(service.id);
      setShowForm(true);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar detalhes do serviço:', error);
      toast.error('Erro ao carregar detalhes do serviço');
      setLoading(false);
    }
  };

  // Abrir formulário para novo serviço
  const handleNew = () => {
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: '',
      active: true,
      categoryId: '',
      professionals: [],
      availabilities: []
    });
    setEditingId(null);
    setShowForm(true);
  };

  // Cancelar edição/criação
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Salvar serviço
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };
      
      if (editingId) {
        // Atualizar serviço existente
        await serviceService.updateService(editingId, serviceData);
        toast.success('Serviço atualizado com sucesso');
      } else {
        // Criar novo serviço
        await serviceService.createService(serviceData);
        toast.success('Serviço criado com sucesso');
      }
      
      // Recarregar lista de serviços
      await fetchServices();
      
      setLoading(false);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast.error('Erro ao salvar serviço: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  // Alternar status do serviço (ativar/desativar)
  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      const service = services.find(s => s.id === id);
      if (!service) return;
      
      // Chamar API para alternar status
      await serviceService.toggleServiceStatus(id);
      
      // Recarregar lista de serviços
      await fetchServices();
      
      toast.success(`Serviço ${service.active ? 'desativado' : 'ativado'} com sucesso`);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      toast.error('Erro ao alterar status do serviço: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Serviços
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os serviços oferecidos pela clínica
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/registrations"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar
            </Link>
            <Link
              to="/categories"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Gerenciar Categorias
            </Link>
            <button
              type="button"
              onClick={handleNew}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Novo Serviço
            </button>
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingId ? 'Editar Serviço' : 'Novo Serviço'}
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
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duração (minutos) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="duration"
                      id="duration"
                      min="5"
                      step="5"
                      value={formData.duration}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Preço (R$) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
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

                <div className="sm:col-span-3">
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <div className="mt-1">
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profissionais Habilitados
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {professionals.map(professional => (
                      <div key={professional.id} className="flex items-center">
                        <input
                          id={`professional-${professional.id}`}
                          name={`professional-${professional.id}`}
                          type="checkbox"
                          checked={formData.professionals.includes(professional.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              professionals: checked
                                ? [...prev.professionals, professional.id]
                                : prev.professionals.filter(id => id !== professional.id)
                            }));
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`professional-${professional.id}`} className="ml-2 block text-sm text-gray-700">
                          {professional.user?.name || 'Profissional sem nome'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="sm:col-span-6 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Disponibilidade
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAvailability}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Adicionar
                    </button>
                  </div>
                  
                  {formData.availabilities.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Nenhuma disponibilidade cadastrada</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.availabilities.map((availability, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <select
                              value={availability.dayOfWeek}
                              onChange={(e) => handleUpdateAvailability(index, 'dayOfWeek', parseInt(e.target.value))}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                <option key={day} value={day}>{getDayName(day)}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <input
                              type="time"
                              value={availability.startTime}
                              onChange={(e) => handleUpdateAvailability(index, 'startTime', e.target.value)}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="time"
                              value={availability.endTime}
                              onChange={(e) => handleUpdateAvailability(index, 'endTime', e.target.value)}
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAvailability(index)}
                              className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Filtros */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Filtros</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleApplyFilters} className="space-y-4">
            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Buscar
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={filter.search}
                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                    placeholder="Nome ou descrição..."
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="filterCategoryId" className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <div className="mt-1">
                  <select
                    id="filterCategoryId"
                    name="categoryId"
                    value={filter.categoryId}
                    onChange={(e) => setFilter({...filter, categoryId: e.target.value})}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Todas</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="filterActive" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="filterActive"
                    name="active"
                    value={filter.active}
                    onChange={(e) => setFilter({...filter, active: e.target.value})}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Todos</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Filtrar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Lista de serviços */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Lista de Serviços</h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">Nenhum serviço cadastrado</p>
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
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duração
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
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
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {service.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof service.price === 'number' 
                          ? `R$ ${service.price.toFixed(2).replace('.', ',')}`
                          : service.price
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.category?.name || 'Sem categoria'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {service.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(service.id)}
                          className={`${service.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {service.active ? 'Desativar' : 'Ativar'}
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

export default ServicesPage;