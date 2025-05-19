// client/src/pages/PatientFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientService } from '../services/api';
import { toast } from 'react-toastify';

const PatientFormPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!patientId;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  // Estado inicial do formulário
  const initialFormState = {
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'not_specified',
    cpf: '',
    rg: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalInfo: {
      bloodType: 'unknown',
      allergies: [],
      chronicConditions: []
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
      planType: ''
    }
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  // Campos de texto para alergias e condições crônicas
  const [allergyText, setAllergyText] = useState('');
  const [conditionText, setConditionText] = useState('');
// Carregar dados do paciente para edição
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatient(patientId);
        
        // Formatar a data de nascimento para o formato do input date
        if (data.dateOfBirth) {
          const date = new Date(data.dateOfBirth);
          data.dateOfBirth = date.toISOString().split('T')[0];
        }
        
        // Formatar a data de validade do convênio para o formato do input date
        if (data.insuranceInfo?.expiryDate) {
          const date = new Date(data.insuranceInfo.expiryDate);
          data.insuranceInfo.expiryDate = date.toISOString().split('T')[0];
        }
        
        // Garantir que todos os objetos aninhados existam
        const formattedData = {
          ...data,
          address: data.address || initialFormState.address,
          emergencyContact: data.emergencyContact || initialFormState.emergencyContact,
          medicalInfo: data.medicalInfo || initialFormState.medicalInfo,
          insuranceInfo: data.insuranceInfo || initialFormState.insuranceInfo
        };
        
        setFormData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar paciente:', error);
        toast.error('Erro ao carregar dados do paciente');
        setLoading(false);
        navigate('/patients');
      }
    };
    
    if (isEditMode) {
      fetchPatient();
    }
  }, [patientId, isEditMode, navigate]);
  
  // Lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Lidar com campos aninhados
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Adicionar alergia
  const handleAddAllergy = () => {
    if (!allergyText.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: [...(prev.medicalInfo.allergies || []), allergyText.trim()]
      }
    }));
    
    setAllergyText('');
  };
  
  // Remover alergia
  const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        allergies: prev.medicalInfo.allergies.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Adicionar condição crônica
  const handleAddCondition = () => {
    if (!conditionText.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        chronicConditions: [...(prev.medicalInfo.chronicConditions || []), conditionText.trim()]
      }
    }));
    
    setConditionText('');
  };
  
  // Remover condição crônica
  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        chronicConditions: prev.medicalInfo.chronicConditions.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name || !formData.phone || !formData.dateOfBirth) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setSaving(true);
      
      if (isEditMode) {
        await patientService.updatePatient(patientId, formData);
        toast.success('Paciente atualizado com sucesso');
      } else {
        await patientService.createPatient(formData);
        toast.success('Paciente cadastrado com sucesso');
      }
      
      setSaving(false);
      navigate('/patients');
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast.error('Erro ao salvar paciente');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isEditMode ? 'Editar Paciente' : 'Novo Paciente'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? 'Atualize as informações do paciente' : 'Preencha as informações para cadastrar um novo paciente'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/patients"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Botões de ação */}
        <div className="flex justify-end">
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
              'Salvar'
            )}
          </button>
        </div>
        
        {/* Informações básicas */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informações Básicas</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Dados pessoais do paciente</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
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
              
              <div className="sm:col-span-2">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gênero
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="not_specified">Não especificado</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                  CPF
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="cpf"
                    id="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="rg" className="block text-sm font-medium text-gray-700">
                  RG
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="rg"
                    id="rg"
                    value={formData.rg}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientFormPage;