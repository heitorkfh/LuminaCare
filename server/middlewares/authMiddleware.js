// server/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e adiciona as informações do usuário ao objeto de requisição
 */
const authMiddleware = async (req, res, next) => {
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
        organizationId: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Adicionar informações do usuário ao objeto de requisição
    req.user = user;

    // Prosseguir para o próximo middleware ou rota
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

module.exports = authMiddleware;