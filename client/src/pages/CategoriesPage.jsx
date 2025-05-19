// client/src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { serviceService } from '../services/serviceApi';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6', // Cor padrão (azul)
    active: true
  });
  const [editingId, setEditingId] = useState(null);

  // Carregar categorias
  useEffect(() => {
    fetchCategories();
  }, []);

  // Buscar categorias
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await serviceService.getCategories();
      setCategories(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
      setLoading(false);
    }
  };

  // Manipular mudança nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Abrir formulário para edição
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      active: category.active
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  // Abrir formulário para nova categoria
  const handleNew = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
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

  // Salvar categoria
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name) {
      toast.error('Por favor, informe o nome da categoria');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingId) {
        // Atualizar categoria existente
        await serviceService.updateCategory(editingId, formData);
        toast.success('Categoria atualizada com sucesso');
      } else {
        // Criar nova categoria
        await serviceService.createCategory(formData);
        toast.success('Categoria criada com sucesso');
      }
      
      // Recarregar lista de categorias
      await fetchCategories();
      
      setLoading(false);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  // Alternar status da categoria (ativar/desativar)
  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      const category = categories.find(c => c.id === id);
      if (!category) return;
      
      // Chamar API para alternar status
      await serviceService.toggleCategoryStatus(id);
      
      // Recarregar lista de categorias
      await fetchCategories();
      
      toast.success(`Categoria ${category.active ? 'desativada' : 'ativada'} com sucesso`);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      toast.error('Erro ao alterar status da categoria: ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Categorias
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie as categorias de serviços da clínica
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voltar para Serviços
            </Link>
            <button
              type="button"
              onClick={handleNew}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Nova Categoria
            </button>
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
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
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Cor
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="color"
                      name="color"
                      id="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="h-8 w-8 border border-gray-300 rounded-md shadow-sm"
                    />
                    <span className="ml-2 text-sm text-gray-500">{formData.color}</span>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-center">
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

      {/* Lista de categorias */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Lista de Categorias</h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">Nenhuma categoria cadastrada</p>
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
                      Cor
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
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="h-6 w-6 rounded-full mr-2" 
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          ></div>
                          <span className="text-sm text-gray-500">{category.color || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {category.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(category.id)}
                          className={`${category.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {category.active ? 'Desativar' : 'Ativar'}
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

export default CategoriesPage;