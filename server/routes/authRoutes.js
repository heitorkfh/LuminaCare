// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar um novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, organizationId, role } = req.body;

    // Validar dados obrigatórios
    if (!name || !email || !password || !organizationId) {
      return res.status(400).json({ message: 'Dados obrigatórios não fornecidos' });
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Verificar se a organização existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organização não encontrada' });
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
        role: role || 'PROFESSIONAL'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true
      }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user,
      token
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar dados obrigatórios
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário (exceto a senha)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// Verificar token e obter dados do usuário atual
router.get('/me', async (req, res) => {
  try {
    // Verificar se o token está presente no cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    // Extrair o token
    const token = authHeader.split(' ')[1];

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

module.exports = router;