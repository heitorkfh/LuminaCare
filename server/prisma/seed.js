// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Dados existentes removidos');

  // Criar organização
  const organization = await prisma.organization.create({
    data: {
      name: 'LuminaCare Clínica',
      subscription: {
        plan: 'premium',
        status: 'active',
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      },
      settings: {
        theme: {
          primaryColor: '#4f46e5',
          secondaryColor: '#10b981',
          fontFamily: 'Inter, sans-serif'
        },
        workingHours: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '08:00', end: '12:00' },
          sunday: { start: null, end: null }
        }
      }
    }
  });

  console.log('Organização criada:', organization.name);

  // Hash para senha padrão
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('senha123', salt);

  // Criar usuários
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@luminacare.com',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: organization.id
    }
  });

  const doctor1 = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Silva',
      email: 'carlos@luminacare.com',
      password: hashedPassword,
      role: 'PROFESSIONAL',
      organizationId: organization.id,
      settings: {
        specialty: 'Clínico Geral',
        crm: '12345-SP'
      }
    }
  });

  const doctor2 = await prisma.user.create({
    data: {
      name: 'Dra. Ana Oliveira',
      email: 'ana@luminacare.com',
      password: hashedPassword,
      role: 'PROFESSIONAL',
      organizationId: organization.id,
      settings: {
        specialty: 'Cardiologia',
        crm: '54321-SP'
      }
    }
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'Maria Recepcionista',
      email: 'maria@luminacare.com',
      password: hashedPassword,
      role: 'RECEPTIONIST',
      organizationId: organization.id
    }
  });

  console.log('Usuários criados:', [admin, doctor1, doctor2, receptionist].map(u => u.name).join(', '));

  // Criar pacientes
  const patient1 = await prisma.patient.create({
    data: {
      name: 'João da Silva',
      phone: '11987654321',
      email: 'joao@email.com',
      dateOfBirth: new Date('1980-05-15'),
      gender: 'male',
      cpf: '12345678901',
      organizationId: organization.id,
      address: {
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil'
      },
      emergencyContact: {
        name: 'Maria da Silva',
        phone: '11987654322',
        relationship: 'Esposa'
      },
      medicalInfo: {
        bloodType: 'O+',
        allergies: ['Penicilina', 'Poeira'],
        chronicConditions: ['Hipertensão']
      }
    }
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Ana Souza',
      phone: '11987654323',
      email: 'ana@email.com',
      dateOfBirth: new Date('1990-10-20'),
      gender: 'female',
      cpf: '98765432101',
      organizationId: organization.id,
      address: {
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        country: 'Brasil'
      },
      medicalInfo: {
        bloodType: 'A+',
        allergies: ['Frutos do mar'],
        chronicConditions: []
      }
    }
  });

  const patient3 = await prisma.patient.create({
    data: {
      name: 'Pedro Santos',
      phone: '11987654324',
      email: 'pedro@email.com',
      dateOfBirth: new Date('1975-03-10'),
      gender: 'male',
      cpf: '45678912301',
      organizationId: organization.id,
      address: {
        street: 'Rua Augusta',
        number: '500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-000',
        country: 'Brasil'
      },
      medicalInfo: {
        bloodType: 'B-',
        allergies: [],
        chronicConditions: ['Diabetes tipo 2']
      }
    }
  });

  console.log('Pacientes criados:', [patient1, patient2, patient3].map(p => p.name).join(', '));

  // Criar agendamentos
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Agendamento para hoje
  const appointment1 = await prisma.appointment.create({
    data: {
      organizationId: organization.id,
      professionalId: doctor1.id,
      patientId: patient1.id,
      scheduledDate: new Date(today.setHours(10, 0, 0, 0)),
      duration: 30,
      status: 'CONFIRMED',
      type: 'Consulta de rotina',
      notes: 'Paciente com queixa de dores de cabeça frequentes'
    }
  });

  // Agendamento para amanhã
  const appointment2 = await prisma.appointment.create({
    data: {
      organizationId: organization.id,
      professionalId: doctor2.id,
      patientId: patient2.id,
      scheduledDate: new Date(tomorrow.setHours(14, 30, 0, 0)),
      duration: 45,
      status: 'SCHEDULED',
      type: 'Avaliação cardiológica',
      notes: 'Primeira consulta com cardiologista'
    }
  });

  // Agendamento para semana que vem
  const appointment3 = await prisma.appointment.create({
    data: {
      organizationId: organization.id,
      professionalId: doctor1.id,
      patientId: patient3.id,
      scheduledDate: new Date(nextWeek.setHours(9, 0, 0, 0)),
      duration: 30,
      status: 'SCHEDULED',
      type: 'Retorno',
      notes: 'Avaliação de exames'
    }
  });

  console.log('Agendamentos criados:', [appointment1, appointment2, appointment3].length);

  // Criar prontuário médico para o primeiro paciente
  const medicalRecord1 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      organizationId: organization.id,
      professionalId: doctor1.id,
      appointmentId: appointment1.id,
      recordType: 'CONSULTATION',
      chiefComplaint: 'Dores de cabeça frequentes há 2 semanas',
      clinicalHistory: 'Paciente relata dores de cabeça pulsáteis, principalmente no período da tarde, com intensidade moderada. Nega traumas recentes, alterações visuais ou outros sintomas associados.',
      physicalExamination: 'Paciente em bom estado geral, lúcido e orientado. Sinais vitais estáveis. Exame neurológico sem alterações.',
      diagnosis: [
        {
          description: 'Cefaleia tensional',
          type: 'primary',
          status: 'confirmed'
        }
      ],
      treatment: 'Prescrição de analgésicos conforme necessidade. Orientações sobre controle de estresse e melhoria da qualidade do sono.',
      prescriptions: [
        {
          medication: 'Paracetamol 750mg',
          dosage: '1 comprimido',
          frequency: 'A cada 6 horas se dor',
          duration: '7 dias',
          instructions: 'Tomar com água'
        }
      ],
      vitalSigns: {
        temperature: { value: 36.5, unit: '°C' },
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        heartRate: 72,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        weight: { value: 75, unit: 'kg' },
        height: { value: 175, unit: 'cm' }
      },
      followUpPlan: {
        notes: 'Retorno em 30 dias para reavaliação',
        recommendedDate: new Date(nextWeek.setDate(nextWeek.getDate() + 30))
      },
      notes: 'Paciente orientado sobre possíveis fatores desencadeantes da cefaleia e medidas não farmacológicas para alívio.',
      status: 'SIGNED',
      signature: {
        professionalName: doctor1.name,
        professionalId: doctor1.id,
        timestamp: new Date()
      }
    }
  });

  console.log('Prontuário médico criado para:', patient1.name);

  // Atualizar o status do agendamento para COMPLETED
  await prisma.appointment.update({
    where: { id: appointment1.id },
    data: { status: 'COMPLETED' }
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });