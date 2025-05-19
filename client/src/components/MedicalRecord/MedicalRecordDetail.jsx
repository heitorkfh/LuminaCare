// client/src/components/MedicalRecord/MedicalRecordDetail.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { medicalRecordService } from '../../services/api';
import { toast } from 'react-toastify';

const MedicalRecordDetail = ({ record, onUpdate, canEdit = false }) => {
  const [loading, setLoading] = useState(false);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [evolutionContent, setEvolutionContent] = useState('');
  const navigate = useNavigate();
  
  if (!record) {
    return <div className="p-4 text-center">Nenhum prontuário selecionado</div>;
  }
  
  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  // Adicionar evolução
  const handleAddEvolution = async (e) => {
    e.preventDefault();
    
    if (!evolutionContent.trim()) {
      toast.error('O conteúdo da evolução não pode estar vazio');
      return;
    }
    
    try {
      setLoading(true);
      const updatedRecord = await medicalRecordService.addEvolution(record.id, evolutionContent);
      setEvolutionContent('');
      setShowEvolutionForm(false);
      setLoading(false);
      
      if (onUpdate) {
        onUpdate(updatedRecord);
      }
      
      toast.success('Evolução adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar evolução:', error);
      toast.error('Erro ao adicionar evolução');
      setLoading(false);
    }
  };
  
  // Mapear tipo de registro para texto legível
  const getRecordTypeText = (type) => {
    const types = {
      'CONSULTATION': 'Consulta',
      'EXAM': 'Exame',
      'PROCEDURE': 'Procedimento',
      'NOTE': 'Anotação',
      'INITIAL_ASSESSMENT': 'Avaliação Inicial'
    };
    return types[type] || type;
  };
  
  // Mapear status para texto legível
  const getStatusText = (status) => {
    const statuses = {
      'DRAFT': 'Rascunho',
      'SIGNED': 'Assinado',
      'AMENDED': 'Emendado'
    };
    return statuses[status] || status;
  };
  
  // Mapear tipo de diagnóstico para texto legível
  const getDiagnosisTypeText = (type) => {
    const types = {
      'primary': 'Primário',
      'secondary': 'Secundário',
      'tertiary': 'Terciário',
      'complication': 'Complicação'
    };
    return types[type] || type;
  };
  
  // Mapear status de diagnóstico para texto legível
  const getDiagnosisStatusText = (status) => {
    const statuses = {
      'confirmed': 'Confirmado',
      'suspected': 'Suspeito',
      'ruled_out': 'Descartado'
    };
    return statuses[status] || status;
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-primary-600 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{getRecordTypeText(record.recordType)}</h2>
            <p className="text-sm opacity-90">{formatDate(record.recordDate)}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              record.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
              record.status === 'SIGNED' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {getStatusText(record.status)}
            </span>
            
            {canEdit && (
              <button
                onClick={() => navigate(`/medical-records/edit/${record.id}`)}
                className="px-3 py-1 bg-white text-primary-700 rounded-md text-sm font-medium hover:bg-primary-50"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="p-6">
        {/* Informações do paciente e profissional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-200">
          {record.patient && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Paciente</h3>
              <p className="text-base font-medium">{record.patient.name}</p>
            </div>
          )}
          
          {record.professional && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Profissional</h3>
              <p className="text-base font-medium">{record.professional.name}</p>
            </div>
          )}
        </div>
        
        {/* Queixa principal */}
        {record.chiefComplaint && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Queixa Principal</h3>
            <p className="text-gray-700 whitespace-pre-line">{record.chiefComplaint}</p>
          </div>
        )}
        
        {/* História clínica */}
        {record.clinicalHistory && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">História Clínica</h3>
            <p className="text-gray-700 whitespace-pre-line">{record.clinicalHistory}</p>
          </div>
        )}
        
        {/* Exame físico */}
        {record.physicalExamination && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Exame Físico</h3>
            <p className="text-gray-700 whitespace-pre-line">{record.physicalExamination}</p>
          </div>
        )}
        
        {/* Sinais vitais */}
        {record.vitalSigns && Object.keys(record.vitalSigns).some(key => record.vitalSigns[key]) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Sinais Vitais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              {record.vitalSigns.temperature?.value && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Temperatura</h4>
                  <p className="text-base">{record.vitalSigns.temperature.value} {record.vitalSigns.temperature.unit || '°C'}</p>
                </div>
              )}
              
              {(record.vitalSigns.bloodPressureSystolic || record.vitalSigns.bloodPressureDiastolic) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Pressão Arterial</h4>
                  <p className="text-base">{record.vitalSigns.bloodPressureSystolic || '-'}/{record.vitalSigns.bloodPressureDiastolic || '-'} mmHg</p>
                </div>
              )}
              
              {record.vitalSigns.heartRate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Freq. Cardíaca</h4>
                  <p className="text-base">{record.vitalSigns.heartRate} bpm</p>
                </div>
              )}
              
              {record.vitalSigns.respiratoryRate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Freq. Respiratória</h4>
                  <p className="text-base">{record.vitalSigns.respiratoryRate} irpm</p>
                </div>
              )}
              
              {record.vitalSigns.oxygenSaturation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Saturação O2</h4>
                  <p className="text-base">{record.vitalSigns.oxygenSaturation}%</p>
                </div>
              )}
              
              {record.vitalSigns.weight?.value && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Peso</h4>
                  <p className="text-base">{record.vitalSigns.weight.value} {record.vitalSigns.weight.unit || 'kg'}</p>
                </div>
              )}
              
              {record.vitalSigns.height?.value && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Altura</h4>
                  <p className="text-base">{record.vitalSigns.height.value} {record.vitalSigns.height.unit || 'cm'}</p>
                </div>
              )}
              
              {record.vitalSigns.bmi && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">IMC</h4>
                  <p className="text-base">{record.vitalSigns.bmi}</p>
                </div>
              )}
              
              {record.vitalSigns.pain?.value && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Dor</h4>
                  <p className="text-base">{record.vitalSigns.pain.value}/10</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Diagnósticos */}
        {record.diagnosis && record.diagnosis.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Diagnósticos</h3>
            <div className="space-y-2">
              {record.diagnosis.map((diag, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-grow">
                      <p className="font-medium">{diag.description}</p>
                      {diag.code && <p className="text-sm text-gray-500">Código: {diag.code}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getDiagnosisTypeText(diag.type)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        diag.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        diag.status === 'suspected' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getDiagnosisStatusText(diag.status)}
                      </span>
                    </div>
                  </div>
                  {diag.notes && <p className="mt-2 text-sm text-gray-600">{diag.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tratamento */}
        {record.treatment && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Tratamento</h3>
            <p className="text-gray-700 whitespace-pre-line">{record.treatment}</p>
          </div>
        )}
        
        {/* Prescrições */}
        {record.prescriptions && record.prescriptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Prescrições</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicamento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosagem
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequência
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duração
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {record.prescriptions.map((prescription, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{prescription.medication}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{prescription.dosage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{prescription.frequency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{prescription.duration || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {record.prescriptions.some(p => p.instructions) && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Instruções Adicionais</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {record.prescriptions
                    .filter(p => p.instructions)
                    .map((p, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{p.medication}:</span> {p.instructions}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Plano de acompanhamento */}
        {record.followUpPlan && Object.keys(record.followUpPlan).some(key => record.followUpPlan[key]) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Plano de Acompanhamento</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {record.followUpPlan.notes && (
                <div className="mb-3">
                  <p className="whitespace-pre-line">{record.followUpPlan.notes}</p>
                </div>
              )}
              
              {record.followUpPlan.recommendedDate && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Retorno Recomendado</h4>
                  <p>{formatDate(record.followUpPlan.recommendedDate)}</p>
                </div>
              )}
              
              {record.followUpPlan.procedures && record.followUpPlan.procedures.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Procedimentos Recomendados</h4>
                  <ul className="list-disc pl-5 mt-1">
                    {record.followUpPlan.procedures.map((proc, index) => (
                      <li key={index}>{proc}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {record.followUpPlan.referrals && record.followUpPlan.referrals.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Encaminhamentos</h4>
                  <ul className="mt-1">
                    {record.followUpPlan.referrals.map((ref, index) => (
                      <li key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                        <p className="font-medium">{ref.speciality}</p>
                        {ref.reason && <p className="text-sm">{ref.reason}</p>}
                        {ref.urgency && (
                          <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                            ref.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                            ref.urgency === 'priority' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ref.urgency === 'urgent' ? 'Urgente' : 
                             ref.urgency === 'priority' ? 'Prioritário' : 'Rotina'}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Observações */}
        {record.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Observações</h3>
            <p className="text-gray-700 whitespace-pre-line">{record.notes}</p>
          </div>
        )}
        
        {/* Evoluções */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800">Evoluções</h3>
            {canEdit && (
              <button
                onClick={() => setShowEvolutionForm(!showEvolutionForm)}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md text-sm font-medium hover:bg-primary-200"
              >
                {showEvolutionForm ? 'Cancelar' : 'Adicionar Evolução'}
              </button>
            )}
          </div>
          
          {showEvolutionForm && (
            <form onSubmit={handleAddEvolution} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={evolutionContent}
                onChange={(e) => setEvolutionContent(e.target.value)}
                rows="3"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                placeholder="Descreva a evolução do paciente"
                required
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Evolução'}
                </button>
              </div>
            </form>
          )}
          
          {record.evolution && record.evolution.length > 0 ? (
            <div className="space-y-4">
              {record.evolution.map((evolution, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">
                      {formatDate(evolution.date)}
                    </div>
                    {evolution.professionalId && (
                      <div className="text-sm font-medium">
                        Dr(a). {evolution.professionalName || 'Profissional'}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{evolution.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Nenhuma evolução registrada</p>
          )}
        </div>
        
        {/* Assinatura */}
        {record.signature && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {record.status === 'SIGNED' ? 'Assinado por' : 'Registrado por'}
              </p>
              <p className="font-medium">{record.signature.professionalName}</p>
              <p className="text-sm text-gray-500">
                {formatDate(record.signature.timestamp)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordDetail;