// server/routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Middleware para verificar se o usuário é admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso não autorizado. Apenas administradores podem realizar esta ação.' });
  }
  next();
};

// Obter a organização atual do usuário
router.get('/current', async (req, res) => {
  try {
    const { organizationId } = req.user;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organização não encontrada' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    res.status(500).json({ message: 'Erro ao buscar organização', error: error.message });
  }
});

// Criar uma nova organização (apenas para super admin ou sistema)
router.post('/', async (req, res) => {
  try {
    // Verificar se o usuário tem permissão para criar organizações
    // Isso pode ser implementado com um middleware específico para super admin
    // Por enquanto, vamos permitir a criação para fins de demonstração

    const { name, subscription, settings } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome da organização é obrigatório' });
    }

    // Criar a organização
    const organization = await prisma.organization.create({
      data: {
        name,
        subscription,
        settings
      }
    });

    res.status(201).json(organization);
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    res.status(500).json({ message: 'Erro ao criar organização', error: error.message });
  }
});

// Atualizar a organização atual
router.put('/current', isAdmin, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { name, subscription, settings } = req.body;

    // Verificar se a organização existe
    const existingOrganization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!existingOrganization) {
      return res.status(404).json({ message: 'Organização não encontrada' });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (subscription !== undefined) updateData.subscription = subscription;
    if (settings !== undefined) updateData.settings = settings;

    // Atualizar a organização
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData
    });

    res.json(updatedOrganization);
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    res.status(500).json({ message: 'Erro ao atualizar organização', error: error.message });
  }
});

// Obter estatísticas da organização
router.get('/current/stats', async (req, res) => {
  try {
    const { organizationId } = req.user;

    // Contar pacientes
    const patientsCount = await prisma.patient.count({
      where: { organizationId }
    });

    // Contar agendamentos
    const appointmentsCount = await prisma.appointment.count({
      where: { organizationId }
    });

    // Contar prontuários
    const medicalRecordsCount = await prisma.medicalRecord.count({
      where: { 
        organizationId,
        isDeleted: false
      }
    });

    // Contar usuários
    const usersCount = await prisma.user.count({
      where: { organizationId }
    });

    // Agendamentos por status
    const appointmentsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "Appointment"
      WHERE "organizationId" = ${organizationId}
      GROUP BY status
    `;

    // Prontuários por tipo
    const medicalRecordsByType = await prisma.$queryRaw`
      SELECT "recordType", COUNT(*) as count
      FROM "MedicalRecord"
      WHERE "organizationId" = ${organizationId} AND "isDeleted" = false
      GROUP BY "recordType"
    `;

    // Converter BigInt para Number nos resultados das consultas raw
    const processedAppointmentsByStatus = appointmentsByStatus.map(item => ({
      status: item.status,
      count: Number(item.count)
    }));

    const processedMedicalRecordsByType = medicalRecordsByType.map(item => ({
      recordType: item.recordType,
      count: Number(item.count)
    }));

    res.json({
      patientsCount,
      appointmentsCount,
      medicalRecordsCount,
      usersCount,
      appointmentsByStatus: processedAppointmentsByStatus,
      medicalRecordsByType: processedMedicalRecordsByType
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

// Obter usuários da organização
router.get('/current/users', isAdmin, async (req, res) => {
  try {
    const { organizationId } = req.user;

    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Atualizar configurações da organização
router.put('/current/settings', isAdmin, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ message: 'Configurações não fornecidas' });
    }

    // Atualizar apenas as configurações
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: { settings }
    });

    res.json(updatedOrganization);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações', error: error.message });
  }
});

module.exports = router;