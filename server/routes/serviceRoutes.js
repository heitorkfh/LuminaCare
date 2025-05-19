// server/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// GET /api/services - Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, active } = req.query;
    const organizationId = req.user.organizationId;

    // Construir filtro
    const where = {
      organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(categoryId && { categoryId }),
      ...(active !== undefined && { active: active === 'true' })
    };

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        professionals: {
          include: {
            professional: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ data: services });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro ao listar serviços' });
  }
});

// GET /api/services/:id - Obter um serviço específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const service = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        category: true,
        professionals: {
          include: {
            professional: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        availabilities: true
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json({ data: service });
  } catch (error) {
    console.error('Erro ao obter serviço:', error);
    res.status(500).json({ error: 'Erro ao obter serviço' });
  }
});

// POST /api/services - Criar um novo serviço
router.post('/', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const {
      name,
      description,
      duration,
      price,
      active,
      categoryId,
      professionals,
      availabilities
    } = req.body;

    // Validar dados
    if (!name || !description || !duration || price === undefined) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Criar serviço com transação para garantir consistência
    const result = await prisma.$transaction(async (prisma) => {
      // Criar serviço
      const service = await prisma.service.create({
        data: {
          name,
          description,
          duration: parseInt(duration),
          price: parseFloat(price),
          active: active !== undefined ? active : true,
          categoryId: categoryId || null,
          organizationId
        }
      });

      // Adicionar profissionais se fornecidos
      if (professionals && professionals.length > 0) {
        await Promise.all(
          professionals.map((professionalId) =>
            prisma.serviceProfessional.create({
              data: {
                serviceId: service.id,
                professionalId
              }
            })
          )
        );
      }

      // Adicionar disponibilidades se fornecidas
      if (availabilities && availabilities.length > 0) {
        await Promise.all(
          availabilities.map((availability) =>
            prisma.serviceAvailability.create({
              data: {
                serviceId: service.id,
                dayOfWeek: availability.dayOfWeek,
                startTime: availability.startTime,
                endTime: availability.endTime
              }
            })
          )
        );
      }

      return service;
    });

    res.status(201).json({ data: result, message: 'Serviço criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// PUT /api/services/:id - Atualizar um serviço
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const {
      name,
      description,
      duration,
      price,
      active,
      categoryId
    } = req.body;

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Atualizar serviço
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        active,
        categoryId: categoryId || null
      }
    });

    res.json({ data: updatedService, message: 'Serviço atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// PUT /api/services/:id/toggle-status - Alternar status do serviço
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Alternar status
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        active: !existingService.active
      }
    });

    res.json({
      data: updatedService,
      message: `Serviço ${updatedService.active ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alternar status do serviço:', error);
    res.status(500).json({ error: 'Erro ao alternar status do serviço' });
  }
});

// DELETE /api/services/:id - Excluir um serviço
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Excluir serviço com transação para garantir consistência
    await prisma.$transaction(async (prisma) => {
      // Remover associações com profissionais
      await prisma.serviceProfessional.deleteMany({
        where: { serviceId: id }
      });

      // Remover disponibilidades
      await prisma.serviceAvailability.deleteMany({
        where: { serviceId: id }
      });

      // Excluir serviço
      await prisma.service.delete({
        where: { id }
      });
    });

    res.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

// GET /api/services/:id/professionals - Listar profissionais de um serviço
router.get('/:id/professionals', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Buscar profissionais associados ao serviço
    const professionals = await prisma.serviceProfessional.findMany({
      where: { serviceId: id },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({ data: professionals });
  } catch (error) {
    console.error('Erro ao listar profissionais do serviço:', error);
    res.status(500).json({ error: 'Erro ao listar profissionais do serviço' });
  }
});

// POST /api/services/:id/professionals - Associar profissional ao serviço
router.post('/:id/professionals', async (req, res) => {
  try {
    const { id } = req.params;
    const { professionalId } = req.body;
    const organizationId = req.user.organizationId;

    if (!professionalId) {
      return res.status(400).json({ error: 'ID do profissional é obrigatório' });
    }

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verificar se o profissional existe e pertence à organização
    const existingProfessional = await prisma.professional.findFirst({
      where: {
        id: professionalId,
        organizationId
      }
    });

    if (!existingProfessional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Verificar se a associação já existe
    const existingAssociation = await prisma.serviceProfessional.findUnique({
      where: {
        serviceId_professionalId: {
          serviceId: id,
          professionalId
        }
      }
    });

    if (existingAssociation) {
      return res.status(400).json({ error: 'Profissional já associado a este serviço' });
    }

    // Criar associação
    const association = await prisma.serviceProfessional.create({
      data: {
        serviceId: id,
        professionalId
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      data: association,
      message: 'Profissional associado ao serviço com sucesso'
    });
  } catch (error) {
    console.error('Erro ao associar profissional ao serviço:', error);
    res.status(500).json({ error: 'Erro ao associar profissional ao serviço' });
  }
});

// DELETE /api/services/:id/professionals/:professionalId - Remover profissional do serviço
router.delete('/:id/professionals/:professionalId', async (req, res) => {
  try {
    const { id, professionalId } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Verificar se a associação existe
    const existingAssociation = await prisma.serviceProfessional.findUnique({
      where: {
        serviceId_professionalId: {
          serviceId: id,
          professionalId
        }
      }
    });

    if (!existingAssociation) {
      return res.status(404).json({ error: 'Profissional não associado a este serviço' });
    }

    // Remover associação
    await prisma.serviceProfessional.delete({
      where: {
        serviceId_professionalId: {
          serviceId: id,
          professionalId
        }
      }
    });

    res.json({ message: 'Profissional removido do serviço com sucesso' });
  } catch (error) {
    console.error('Erro ao remover profissional do serviço:', error);
    res.status(500).json({ error: 'Erro ao remover profissional do serviço' });
  }
});

// GET /api/services/:id/availability - Obter disponibilidade de um serviço
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Buscar disponibilidades do serviço
    const availabilities = await prisma.serviceAvailability.findMany({
      where: { serviceId: id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({ data: availabilities });
  } catch (error) {
    console.error('Erro ao obter disponibilidade do serviço:', error);
    res.status(500).json({ error: 'Erro ao obter disponibilidade do serviço' });
  }
});

// PUT /api/services/:id/availability - Atualizar disponibilidade de um serviço
router.put('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { availabilities } = req.body;
    const organizationId = req.user.organizationId;

    if (!availabilities || !Array.isArray(availabilities)) {
      return res.status(400).json({ error: 'Dados de disponibilidade inválidos' });
    }

    // Verificar se o serviço existe e pertence à organização
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Atualizar disponibilidades com transação
    await prisma.$transaction(async (prisma) => {
      // Remover disponibilidades existentes
      await prisma.serviceAvailability.deleteMany({
        where: { serviceId: id }
      });

      // Adicionar novas disponibilidades
      if (availabilities.length > 0) {
        await Promise.all(
          availabilities.map((availability) =>
            prisma.serviceAvailability.create({
              data: {
                serviceId: id,
                dayOfWeek: availability.dayOfWeek,
                startTime: availability.startTime,
                endTime: availability.endTime
              }
            })
          )
        );
      }
    });

    // Buscar disponibilidades atualizadas
    const updatedAvailabilities = await prisma.serviceAvailability.findMany({
      where: { serviceId: id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({
      data: updatedAvailabilities,
      message: 'Disponibilidade atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade do serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar disponibilidade do serviço' });
  }
});

module.exports = router;