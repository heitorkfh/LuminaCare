// client/src/components/MedicalRecord/MedicalRecordForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { medicalRecordService, patientService } from '../../services/api';
import { toast } from 'react-toastify';

const MedicalRecordForm = ({ patientId, appointmentId, recordId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      recordType: 'CONSULTATION',
      status: 'DRAFT'
    }
  });
  
  // Campos de diagnóstico dinâmicos
  const [diagnoses, setDiagnoses] = useState([{ description: '', type: 'primary', status: 'confirmed' }]);
  
  // Campos de prescrição dinâmicos
  const [prescriptions, setPrescriptions] = useState([{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  
  // Campos de sinais vitais
  const [vitalSigns, setVitalSigns] = useState({
    temperature: { value: '', unit: '°C' },
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: { value: '', unit: 'kg' },
    height: { value: '', unit: 'cm' },
    pain: { value: '', location: '', characteristics: '' }
  });
  
  // Carregar dados do paciente
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await patientService.getPatient(patientId);
        setPatient(data);
      } catch (error) {
        console.error('Erro ao carregar paciente:', error);
        toast.error('Erro ao carregar dados do paciente');
      }
    };
    
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);
  
  // Carregar dados do prontuário existente para edição
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await medicalRecordService.getRecord(recordId);
        setExistingRecord(data);
        
        // Preencher o formulário com os dados existentes
        setValue('recordType', data.recordType);
        setValue('chiefComplaint', data.chiefComplaint);
        setValue('clinicalHistory', data.clinicalHistory);
        setValue('physicalExamination', data.physicalExamination);
        setValue('treatment', data.treatment);
        setValue('notes', data.notes);
        setValue('status', data.status);
        
        // Preencher diagnósticos
        if (data.diagnosis && data.diagnosis.length > 0) {
          setDiagnoses(data.diagnosis);
        }
        
        // Preencher prescrições
        if (data.prescriptions && data.prescriptions.length > 0) {
          setPrescriptions(data.prescriptions);
        }
        
        // Preencher sinais vitais
        if (data.vitalSigns) {
          setVitalSigns(data.vitalSigns);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar prontuário:', error);
        toast.error('Erro ao carregar dados do prontuário');
        setLoading(false);
      }
    };
    
    if (recordId) {
      fetchRecord();
    }
  }, [recordId, setValue]);
  
  // Adicionar diagnóstico
  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { description: '', type: 'primary', status: 'confirmed' }]);
  };
  
  // Remover diagnóstico
  const removeDiagnosis = (index) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses.splice(index, 1);
    setDiagnoses(newDiagnoses);
  };
  
  // Atualizar diagnóstico
  const updateDiagnosis = (index, field, value) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses[index][field] = value;
    setDiagnoses(newDiagnoses);
  };
  
  // Adicionar prescrição
  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };
  
  // Remover prescrição
  const removePrescription = (index) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions.splice(index, 1);
    setPrescriptions(newPrescriptions);
  };
  
  // Atualizar prescrição
  const updatePrescription = (index, field, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index][field] = value;
    setPrescriptions(newPrescriptions);
  };
  
  // Atualizar sinais vitais
  const updateVitalSigns = (field, value, subfield = null) => {
    if (subfield) {
      setVitalSigns({
        ...vitalSigns,
        [field]: {
          ...vitalSigns[field],
          [subfield]: value
        }
      });
    } else {
      setVitalSigns({
        ...vitalSigns,
        [field]: value
      });
    }
  };
  
  // Enviar formulário
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const recordData = {
        ...data,
        patientId,
        appointmentId,
        diagnosis: diagnoses,
        prescriptions,
        vitalSigns
      };
      
      let response;
      
      if (recordId) {
        // Atualizar prontuário existente
        response = await medicalRecordService.updateRecord(recordId, recordData);
        toast.success('Prontuário atualizado com sucesso');
      } else {
        // Criar novo prontuário
        response = await medicalRecordService.createRecord(recordData);
        toast.success('Prontuário criado com sucesso');
      }
      
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate(`/medical-records/${response.id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
      toast.error('Erro ao salvar prontuário');
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>;
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {patient && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Paciente: {patient.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <span className="text-sm text-gray-500">Data de Nascimento:</span>
              <p>{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Telefone:</span>
              <p>{patient.phone}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email:</span>
              <p>{patient.email || 'Não informado'}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Registro
            </label>
            <select
              {...register('recordType', { required: 'Tipo de registro é obrigatório' })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            >
              <option value="CONSULTATION">Consulta</option>
              <option value="EXAM">Exame</option>
              <option value="PROCEDURE">Procedimento</option>
              <option value="NOTE">Anotação</option>
              <option value="INITIAL_ASSESSMENT">Avaliação Inicial</option>
            </select>
            {errors.recordType && (
              <p className="mt-1 text-sm text-red-600">{errors.recordType.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="SIGNED">Assinado</option>
              <option value="AMENDED">Emendado</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Queixa Principal
          </label>
          <textarea
            {...register('chiefComplaint')}
            rows="2"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            placeholder="Descreva a queixa principal do paciente"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            História Clínica
          </label>
          <textarea
            {...register('clinicalHistory')}
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            placeholder="Descreva a história clínica relevante"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exame Físico
          </label>
          <textarea
            {...register('physicalExamination')}
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            placeholder="Descreva os achados do exame físico"
          ></textarea>
        </div>
        
        {/* Sinais Vitais */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Sinais Vitais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperatura
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temperature.value}
                  onChange={(e) => updateVitalSigns('temperature', e.target.value, 'value')}
                  className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="36.5"
                />
                <select
                  value={vitalSigns.temperature.unit}
                  onChange={(e) => updateVitalSigns('temperature', e.target.value, 'unit')}
                  className="rounded-r-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <option value="°C">°C</option>
                  <option value="°F">°F</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressão Arterial
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={vitalSigns.bloodPressureSystolic}
                  onChange={(e) => updateVitalSigns('bloodPressureSystolic', e.target.value)}
                  className="w-1/2 rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="120"
                />
                <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 border-t border-b border-gray-300">
                  /
                </span>
                <input
                  type="number"
                  value={vitalSigns.bloodPressureDiastolic}
                  onChange={(e) => updateVitalSigns('bloodPressureDiastolic', e.target.value)}
                  className="w-1/2 rounded-r-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="80"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência Cardíaca
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={vitalSigns.heartRate}
                  onChange={(e) => updateVitalSigns('heartRate', e.target.value)}
                  className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="72"
                />
                <span className="inline-flex items-center px-3 rounded-r-md bg-gray-100 text-gray-600 border border-l-0 border-gray-300">
                  bpm
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência Respiratória
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={vitalSigns.respiratoryRate}
                  onChange={(e) => updateVitalSigns('respiratoryRate', e.target.value)}
                  className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="16"
                />
                <span className="inline-flex items-center px-3 rounded-r-md bg-gray-100 text-gray-600 border border-l-0 border-gray-300">
                  irpm
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturação de O2
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={vitalSigns.oxygenSaturation}
                  onChange={(e) => updateVitalSigns('oxygenSaturation', e.target.value)}
                  className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="98"
                />
                <span className="inline-flex items-center px-3 rounded-r-md bg-gray-100 text-gray-600 border border-l-0 border-gray-300">
                  %
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso
              </label>
              <div className="flex">
                <input
                  type="number"
                  step="0.1"
                  value={vitalSigns.weight.value}
                  onChange={(e) => updateVitalSigns('weight', e.target.value, 'value')}
                  className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="70.5"
                />
                <select
                  value={vitalSigns.weight.unit}
                  onChange={(e) => updateVitalSigns('weight', e.target.value, 'unit')}
                  className="rounded-r-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura
              </label>
              <div className="flex">
                <input
                  type="number"
                  value={vitalSigns.height.value}
                  onChange={(e) => updateVitalSigns('height', e.target.value, 'value')}
                  className="w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="170"
                />
                <select
                  value={vitalSigns.height.unit}
                  onChange={(e) => updateVitalSigns('height', e.target.value, 'unit')}
                  className="rounded-r-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="in">in</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dor (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={vitalSigns.pain.value}
                onChange={(e) => updateVitalSigns('pain', e.target.value, 'value')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        
        {/* Diagnósticos */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">Diagnósticos</h3>
            <button
              type="button"
              onClick={addDiagnosis}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Adicionar
            </button>
          </div>
          
          {diagnoses.map((diagnosis, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 mb-3 p-3 border border-gray-200 rounded-md">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={diagnosis.description}
                  onChange={(e) => updateDiagnosis(index, 'description', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Descrição do diagnóstico"
                  required
                />
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={diagnosis.type}
                  onChange={(e) => updateDiagnosis(index, 'type', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <option value="primary">Primário</option>
                  <option value="secondary">Secundário</option>
                  <option value="tertiary">Terciário</option>
                  <option value="complication">Complicação</option>
                </select>
              </div>
              
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={diagnosis.status}
                  onChange={(e) => updateDiagnosis(index, 'status', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <option value="confirmed">Confirmado</option>
                  <option value="suspected">Suspeito</option>
                  <option value="ruled_out">Descartado</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeDiagnosis(index)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Tratamento */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tratamento
          </label>
          <textarea
            {...register('treatment')}
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            placeholder="Descreva o tratamento recomendado"
          ></textarea>
        </div>
        
        {/* Prescrições */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-800">Prescrições</h3>
            <button
              type="button"
              onClick={addPrescription}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Adicionar
            </button>
          </div>
          
          {prescriptions.map((prescription, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-3 p-3 border border-gray-200 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicamento
                </label>
                <input
                  type="text"
                  value={prescription.medication}
                  onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Nome do medicamento"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosagem
                </label>
                <input
                  type="text"
                  value={prescription.dosage}
                  onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Ex: 500mg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência
                </label>
                <input
                  type="text"
                  value={prescription.frequency}
                  onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Ex: 8/8h"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração
                </label>
                <input
                  type="text"
                  value={prescription.duration}
                  onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Ex: 7 dias"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removePrescription(index)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remover
                </button>
              </div>
              
              <div className="col-span-1 md:col-span-2 lg:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruções
                </label>
                <input
                  type="text"
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Instruções adicionais"
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Observações */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            {...register('notes')}
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            placeholder="Observações adicionais"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : recordId ? 'Atualizar Prontuário' : 'Criar Prontuário'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;