// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
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

// Obter todos os usuários da organização (apenas admin)
router.get('/', isAdmin, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { search, role, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    
    // Construir a consulta base
    const whereClause = {
      organizationId
    };

    // Adicionar filtros se fornecidos
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    // Buscar usuários com paginação
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: {
        name: 'asc'
      }
    });

    // Contar total de usuários para paginação
    const total = await prisma.user.count({
      where: whereClause
    });

    res.json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Obter um usuário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, role } = req.user;

    // Verificar se o usuário tem permissão para ver outros usuários
    if (id !== req.user.id && role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso não autorizado. Apenas administradores podem ver outros usuários.' });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        organizationId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
});

// Criar um novo usuário (apenas admin)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { name, email, password, role, settings } = req.body;

    // Validar dados obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizationId,
        role: role || 'PROFESSIONAL',
        settings
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// Atualizar um usuário existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, role: currentUserRole } = req.user;
    const { name, email, role, settings } = req.body;

    // Verificar se o usuário tem permissão para atualizar outros usuários
    if (id !== req.user.id && currentUserRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso não autorizado. Apenas administradores podem atualizar outros usuários.' });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar permissões
    if (existingUser.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este usuário' });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (userWithEmail) {
        return res.status(400).json({ message: 'Este email já está em uso por outro usuário' });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    // Apenas admin pode alterar o papel do usuário
    if (role && currentUserRole === 'ADMIN') {
      updateData.role = role;
    }
    
    if (settings !== undefined) updateData.settings = settings;

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Alterar senha
router.put('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId, role: currentUserRole } = req.user;
    const { currentPassword, newPassword } = req.body;

    // Verificar se o usuário tem permissão para alterar a senha de outros usuários
    const isChangingSelf = id === req.user.id;
    const isAdmin = currentUserRole === 'ADMIN';

    if (!isChangingSelf && !isAdmin) {
      return res.status(403).json({ message: 'Acesso não autorizado. Apenas administradores podem alterar a senha de outros usuários.' });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar permissões
    if (user.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este usuário' });
    }

    // Se estiver alterando a própria senha, verificar a senha atual
    if (isChangingSelf && !isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Senha atual é obrigatória' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar a senha
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha', error: error.message });
  }
});

// Excluir um usuário (apenas admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Não permitir que o usuário exclua a si mesmo
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário' });
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar permissões
    if (existingUser.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este usuário' });
    }

    // Verificar se existem prontuários ou agendamentos associados
    const medicalRecordsCount = await prisma.medicalRecord.count({
      where: {
        professionalId: id,
        isDeleted: false
      }
    });

    const appointmentsCount = await prisma.appointment.count({
      where: {
        professionalId: id,
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      }
    });

    if (medicalRecordsCount > 0 || appointmentsCount > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir o usuário pois existem prontuários ou agendamentos associados',
        medicalRecordsCount,
        appointmentsCount
      });
    }

    // Excluir o usuário
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário', error: error.message });
  }
});

// Obter estatísticas do usuário (agendamentos, prontuários)
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: {
        id,
        organizationId
      },
      select: {
        id: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Contar agendamentos
    const appointmentsCount = await prisma.appointment.count({
      where: {
        professionalId: id,
        organizationId
      }
    });

    // Contar prontuários
    const medicalRecordsCount = await prisma.medicalRecord.count({
      where: {
        professionalId: id,
        organizationId,
        isDeleted: false
      }
    });

    // Agendamentos por status
    const appointmentsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM "Appointment"
      WHERE "professionalId" = ${id} AND "organizationId" = ${organizationId}
      GROUP BY status
    `;

    // Prontuários por tipo
    const medicalRecordsByType = await prisma.$queryRaw`
      SELECT "recordType", COUNT(*) as count
      FROM "MedicalRecord"
      WHERE "professionalId" = ${id} AND "organizationId" = ${organizationId} AND "isDeleted" = false
      GROUP BY "recordType"
    `;

    // Próximos agendamentos
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId: id,
        organizationId,
        scheduledDate: {
          gte: new Date()
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      orderBy: {
        scheduledDate: 'asc'
      },
      take: 5,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    res.json({
      user,
      appointmentsCount,
      medicalRecordsCount,
      appointmentsByStatus,
      medicalRecordsByType,
      upcomingAppointments
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas do usuário', error: error.message });
  }
});

module.exports = router;