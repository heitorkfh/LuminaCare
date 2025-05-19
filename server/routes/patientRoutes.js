// server/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Obter todos os pacientes da organização
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { search, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    
    // Construir a consulta base
    const whereClause = {
      organizationId
    };

    // Adicionar filtro de pesquisa se fornecido
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { cpf: { contains: search } }
      ];
    }

    // Buscar pacientes com paginação
    const patients = await prisma.patient.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: {
        name: 'asc'
      }
    });

    // Contar total de pacientes para paginação
    const total = await prisma.patient.count({
      where: whereClause
    });

    res.json({
      data: patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ message: 'Erro ao buscar pacientes', error: error.message });
  }
});

// Obter um paciente específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const patient = await prisma.patient.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ message: 'Erro ao buscar paciente', error: error.message });
  }
});

// Criar um novo paciente
router.post('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const {
      name,
      phone,
      email,
      dateOfBirth,
      gender,
      cpf,
      rg,
      address,
      emergencyContact,
      insuranceInfo,
      medicalInfo,
      customFields
    } = req.body;

    // Validar dados obrigatórios
    if (!name || !phone || !dateOfBirth) {
      return res.status(400).json({ message: 'Nome, telefone e data de nascimento são obrigatórios' });
    }

    // Verificar se já existe um paciente com o mesmo CPF (se fornecido)
    if (cpf) {
      const existingPatient = await prisma.patient.findFirst({
        where: {
          cpf,
          organizationId
        }
      });

      if (existingPatient) {
        return res.status(400).json({ message: 'Já existe um paciente com este CPF' });
      }
    }

    // Criar o paciente
    const patient = await prisma.patient.create({
      data: {
        organizationId,
        name,
        phone,
        email,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        cpf,
        rg,
        address,
        emergencyContact,
        insuranceInfo,
        medicalInfo,
        customFields
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({ message: 'Erro ao criar paciente', error: error.message });
  }
});

// Atualizar um paciente existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const {
      name,
      phone,
      email,
      dateOfBirth,
      gender,
      cpf,
      rg,
      address,
      emergencyContact,
      insuranceInfo,
      medicalInfo,
      customFields
    } = req.body;

    // Verificar se o paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Verificar permissões
    if (existingPatient.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este paciente' });
    }

    // Verificar se o CPF já está em uso por outro paciente (se for alterado)
    if (cpf && cpf !== existingPatient.cpf) {
      const patientWithCpf = await prisma.patient.findFirst({
        where: {
          cpf,
          organizationId,
          id: { not: id }
        }
      });

      if (patientWithCpf) {
        return res.status(400).json({ message: 'Já existe outro paciente com este CPF' });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) updateData.gender = gender;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (rg !== undefined) updateData.rg = rg;
    if (address !== undefined) updateData.address = address;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (insuranceInfo !== undefined) updateData.insuranceInfo = insuranceInfo;
    if (medicalInfo !== undefined) updateData.medicalInfo = medicalInfo;
    if (customFields !== undefined) updateData.customFields = customFields;

    // Atualizar o paciente
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: updateData
    });

    res.json(updatedPatient);
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ message: 'Erro ao atualizar paciente', error: error.message });
  }
});

// Excluir um paciente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Verificar se o paciente existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Verificar permissões
    if (existingPatient.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este paciente' });
    }

    // Verificar se existem prontuários ou agendamentos associados
    const medicalRecordsCount = await prisma.medicalRecord.count({
      where: {
        patientId: id,
        isDeleted: false
      }
    });

    const appointmentsCount = await prisma.appointment.count({
      where: {
        patientId: id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (medicalRecordsCount > 0 || appointmentsCount > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir o paciente pois existem prontuários ou agendamentos associados',
        medicalRecordsCount,
        appointmentsCount
      });
    }

    // Excluir o paciente
    await prisma.patient.delete({
      where: { id }
    });

    res.json({ message: 'Paciente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    res.status(500).json({ message: 'Erro ao excluir paciente', error: error.message });
  }
});

// Obter o histórico médico completo de um paciente
router.get('/:id/medical-history', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: {
        id,
        organizationId
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Buscar todos os prontuários do paciente
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: id,
        organizationId,
        isDeleted: false
      },
      orderBy: {
        recordDate: 'desc'
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Buscar todos os agendamentos do paciente
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: id,
        organizationId
      },
      orderBy: {
        scheduledDate: 'desc'
      }
    });

    res.json({
      patient,
      medicalRecords,
      appointments
    });
  } catch (error) {
    console.error('Erro ao buscar histórico médico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico médico', error: error.message });
  }
});

module.exports = router;