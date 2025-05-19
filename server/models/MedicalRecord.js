// server/models/MedicalRecord.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MedicalRecordSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'ID do paciente é obrigatório']
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'ID da organização é obrigatório']
  },
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do profissional é obrigatório']
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recordType: {
    type: String,
    enum: ['consultation', 'exam', 'procedure', 'note', 'initial_assessment'],
    required: [true, 'Tipo de registro é obrigatório']
  },
  recordDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Data do registro é obrigatória']
  },
  chiefComplaint: {
    type: String,
    trim: true
  },
  clinicalHistory: {
    type: String,
    trim: true
  },
  physicalExamination: {
    type: String,
    trim: true
  },
  diagnosis: [{
    code: String,
    description: {
      type: String,
      required: [true, 'Descrição do diagnóstico é obrigatória']
    },
    type: {
      type: String,
      enum: ['primary', 'secondary', 'tertiary', 'complication'],
      default: 'primary'
    },
    status: {
      type: String,
      enum: ['confirmed', 'suspected', 'ruled_out'],
      default: 'confirmed'
    },
    notes: String
  }],
  treatment: {
    type: String,
    trim: true
  },
  prescriptions: [{
    medication: {
      type: String,
      required: [true, 'Nome do medicamento é obrigatório']
    },
    dosage: {
      type: String,
      required: [true, 'Dosagem é obrigatória']
    },
    frequency: {
      type: String,
      required: [true, 'Frequência é obrigatória']
    },
    duration: String,
    instructions: String,
    startDate: Date,
    endDate: Date,
    active: {
      type: Boolean,
      default: true
    }
  }],
  vitalSigns: {
    temperature: {
      value: Number,
      unit: {
        type: String,
        default: '°C'
      }
    },
    bloodPressureSystolic: Number,
    bloodPressureDiastolic: Number,
    heartRate: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: {
      value: Number,
      unit: {
        type: String,
        default: 'kg'
      }
    },
    height: {
      value: Number,
      unit: {
        type: String,
        default: 'cm'
      }
    },
    bmi: Number,
    pain: {
      value: Number, // Escala de 0-10
      location: String,
      characteristics: String
    },
    glucoseLevel: Number
  },
  labResults: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: String,
    referenceRange: String,
    abnormal: Boolean,
    observationDate: Date,
    notes: String
  }],
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: Number,
    storageUrl: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    category: {
      type: String,
      enum: ['lab_result', 'imaging', 'prescription', 'consent_form', 'other'],
      default: 'other'
    }
  }],
  followUpPlan: {
    notes: String,
    recommendedDate: Date,
    procedures: [String],
    referrals: [{
      speciality: String,
      reason: String,
      urgency: {
        type: String,
        enum: ['routine', 'priority', 'urgent'],
        default: 'routine'
      }
    }]
  },
  notes: {
    type: String,
    trim: true
  },
  evolution: [{
    date: {
      type: Date,
      default: Date.now
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  permissions: {
    restrictedAccess: {
      type: Boolean,
      default: false
    },
    authorizedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  signature: {
    professionalName: {
      type: String,
      required: true
    },
    professionalId: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    signatureHash: String
  },
  status: {
    type: String,
    enum: ['draft', 'signed', 'amended'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance de consultas
MedicalRecordSchema.index({ patientId: 1, recordDate: -1 });
MedicalRecordSchema.index({ organizationId: 1, recordDate: -1 });
MedicalRecordSchema.index({ professionalId: 1, recordDate: -1 });
MedicalRecordSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });
MedicalRecordSchema.index({ 'diagnosis.description': 'text' });

// Método para verificar permissões de acesso
MedicalRecordSchema.methods.canBeAccessedBy = function(user) {
  // Se o registro não tem restrição de acesso, qualquer usuário da organização pode acessar
  if (!this.permissions.restrictedAccess) {
    return this.organizationId.equals(user.organizationId);
  }
  
  // Se tem restrição, verifica se o usuário está na lista de autorizados
  return this.permissions.authorizedUsers.some(id => id.equals(user._id)) || 
         this.professionalId.equals(user._id);
};

// Hook para calcular o IMC antes de salvar, se altura e peso estiverem disponíveis
MedicalRecordSchema.pre('save', function(next) {
  if (this.vitalSigns && 
      this.vitalSigns.weight && 
      this.vitalSigns.height && 
      this.vitalSigns.weight.value && 
      this.vitalSigns.height.value) {
    
    // Convertendo altura de cm para m
    const heightInMeters = this.vitalSigns.height.value / 100;
    
    // Cálculo do IMC: peso (kg) / (altura (m))²
    this.vitalSigns.bmi = +(this.vitalSigns.weight.value / (heightInMeters * heightInMeters)).toFixed(2);
  }
  
  next();
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
