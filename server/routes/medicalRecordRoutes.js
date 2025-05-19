// server/routes/medicalRecordRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Obter todos os prontuários de um paciente
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { organizationId } = req.user;

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId,
        organizationId,
        isDeleted: false
      },
      orderBy: {
        recordDate: 'desc'
      }
    });

    res.json(medicalRecords);
  } catch (error) {
    console.error('Erro ao buscar prontuários:', error);
    res.status(500).json({ message: 'Erro ao buscar prontuários', error: error.message });
  }
});

// Obter um prontuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: {
        id,
        organizationId,
        isDeleted: false
      },
      include: {
        patient: true,
        professional: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        appointment: true
      }
    });

    if (!medicalRecord) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    // Verificar permissões (simplificado - expandir conforme necessário)
    if (medicalRecord.permissions && medicalRecord.permissions.restrictedAccess) {
      const authorizedUsers = medicalRecord.permissions.authorizedUsers || [];
      if (!authorizedUsers.includes(req.user.id) && medicalRecord.professionalId !== req.user.id) {
        return res.status(403).json({ message: 'Acesso não autorizado a este prontuário' });
      }
    }

    res.json(medicalRecord);
  } catch (error) {
    console.error('Erro ao buscar prontuário:', error);
    res.status(500).json({ message: 'Erro ao buscar prontuário', error: error.message });
  }
});

// Criar um novo prontuário
router.post('/', async (req, res) => {
  try {
    const { organizationId, id: professionalId } = req.user;
    const {
      patientId,
      appointmentId,
      recordType,
      chiefComplaint,
      clinicalHistory,
      physicalExamination,
      diagnosis,
      treatment,
      prescriptions,
      vitalSigns,
      followUpPlan,
      notes
    } = req.body;

    // Validar dados obrigatórios
    if (!patientId || !recordType) {
      return res.status(400).json({ message: 'Dados obrigatórios não fornecidos' });
    }

    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId, organizationId }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Criar o prontuário
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        organizationId,
        professionalId,
        appointmentId,
        recordType,
        chiefComplaint,
        clinicalHistory,
        physicalExamination,
        diagnosis,
        treatment,
        prescriptions,
        vitalSigns,
        followUpPlan,
        notes,
        signature: {
          professionalName: req.user.name,
          professionalId: professionalId,
          timestamp: new Date()
        }
      }
    });

    // Se houver um appointmentId, atualizar o status da consulta para COMPLETED
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' }
      });
    }

    res.status(201).json(medicalRecord);
  } catch (error) {
    console.error('Erro ao criar prontuário:', error);
    res.status(500).json({ message: 'Erro ao criar prontuário', error: error.message });
  }
});

// Atualizar um prontuário existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, id: professionalId } = req.user;
    const {
      chiefComplaint,
      clinicalHistory,
      physicalExamination,
      diagnosis,
      treatment,
      prescriptions,
      vitalSigns,
      followUpPlan,
      notes,
      status
    } = req.body;

    // Verificar se o prontuário existe
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    // Verificar permissões
    if (existingRecord.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este prontuário' });
    }

    // Verificar se o prontuário já está assinado
    if (existingRecord.status === 'SIGNED' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Não é possível editar um prontuário já assinado' });
    }

    // Atualizar o prontuário
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        chiefComplaint,
        clinicalHistory,
        physicalExamination,
        diagnosis,
        treatment,
        prescriptions,
        vitalSigns,
        followUpPlan,
        notes,
        status,
        updatedAt: new Date()
      }
    });

    res.json(updatedRecord);
  } catch (error) {
    console.error('Erro ao atualizar prontuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar prontuário', error: error.message });
  }
});

// Adicionar evolução a um prontuário
router.post('/:id/evolution', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, id: professionalId } = req.user;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Conteúdo da evolução é obrigatório' });
    }

    // Verificar se o prontuário existe
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    // Verificar permissões
    if (existingRecord.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este prontuário' });
    }

    // Obter evoluções existentes ou inicializar array vazio
    const currentEvolution = existingRecord.evolution || [];

    // Adicionar nova evolução
    const newEvolution = [
      ...currentEvolution,
      {
        date: new Date(),
        professionalId,
        content
      }
    ];

    // Atualizar o prontuário
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        evolution: newEvolution,
        updatedAt: new Date()
      }
    });

    res.json(updatedRecord);
  } catch (error) {
    console.error('Erro ao adicionar evolução:', error);
    res.status(500).json({ message: 'Erro ao adicionar evolução', error: error.message });
  }
});

// Adicionar anexo a um prontuário
router.post('/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, id: professionalId } = req.user;
    const { fileName, fileType, fileSize, storageUrl, description, category } = req.body;

    if (!fileName || !fileType || !storageUrl) {
      return res.status(400).json({ message: 'Dados do anexo incompletos' });
    }

    // Verificar se o prontuário existe
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    // Verificar permissões
    if (existingRecord.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este prontuário' });
    }

    // Obter anexos existentes ou inicializar array vazio
    const currentAttachments = existingRecord.attachments || [];

    // Adicionar novo anexo
    const newAttachments = [
      ...currentAttachments,
      {
        fileName,
        fileType,
        fileSize,
        storageUrl,
        uploadDate: new Date(),
        description,
        category: category || 'other',
        uploadedBy: professionalId
      }
    ];

    // Atualizar o prontuário
    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        attachments: newAttachments,
        updatedAt: new Date()
      }
    });

    res.json(updatedRecord);
  } catch (error) {
    console.error('Erro ao adicionar anexo:', error);
    res.status(500).json({ message: 'Erro ao adicionar anexo', error: error.message });
  }
});

// Excluir um prontuário (exclusão lógica)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Verificar se o prontuário existe
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ message: 'Prontuário não encontrado' });
    }

    // Verificar permissões
    if (existingRecord.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este prontuário' });
    }

    // Verificar se o usuário tem permissão para excluir (apenas admin ou o profissional que criou)
    if (req.user.role !== 'ADMIN' && existingRecord.professionalId !== req.user.id) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este prontuário' });
    }

    // Exclusão lógica
    await prisma.medicalRecord.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Prontuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir prontuário:', error);
    res.status(500).json({ message: 'Erro ao excluir prontuário', error: error.message });
  }
});

module.exports = router;