// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// GET /api/categories - Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const organizationId = req.user.organizationId;

    // Construir filtro
    const where = {
      organizationId,
      ...(active !== undefined && { active: active === 'true' })
    };

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({ data: categories });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
});

// GET /api/categories/:id - Obter uma categoria específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const category = await prisma.category.findFirst({
      where: {
        id,
        organizationId
      },
      include: {
        services: true
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ data: category });
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({ error: 'Erro ao obter categoria' });
  }
});

// POST /api/categories - Criar uma nova categoria
router.post('/', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { name, description, color, active } = req.body;

    // Validar dados
    if (!name) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
        active: active !== undefined ? active : true,
        organizationId
      }
    });

    res.status(201).json({ data: category, message: 'Categoria criada com sucesso' });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// PUT /api/categories/:id - Atualizar uma categoria
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const { name, description, color, active } = req.body;

    // Verificar se a categoria existe e pertence à organização
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Validar dados
    if (!name) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    // Atualizar categoria
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color,
        active
      }
    });

    res.json({ data: updatedCategory, message: 'Categoria atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// PUT /api/categories/:id/toggle-status - Alternar status da categoria
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se a categoria existe e pertence à organização
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Alternar status
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        active: !existingCategory.active
      }
    });

    res.json({
      data: updatedCategory,
      message: `Categoria ${updatedCategory.active ? 'ativada' : 'desativada'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alternar status da categoria:', error);
    res.status(500).json({ error: 'Erro ao alternar status da categoria' });
  }
});

// DELETE /api/categories/:id - Excluir uma categoria
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Verificar se a categoria existe e pertence à organização
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        organizationId
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se há serviços associados
    const servicesCount = await prisma.service.count({
      where: {
        categoryId: id
      }
    });

    if (servicesCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir a categoria pois existem serviços associados a ela'
      });
    }

    // Excluir categoria
    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ error: 'Erro ao excluir categoria' });
  }
});

module.exports = router;