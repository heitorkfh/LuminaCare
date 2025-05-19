// server/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Obter todos os agendamentos da organização
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { 
      startDate, 
      endDate, 
      status, 
      professionalId, 
      patientId,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Construir a consulta base
    const whereClause = {
      organizationId
    };

    // Adicionar filtros se fornecidos
    if (startDate) {
      whereClause.scheduledDate = {
        ...whereClause.scheduledDate,
        gte: new Date(startDate)
      };
    }

    if (endDate) {
      whereClause.scheduledDate = {
        ...whereClause.scheduledDate,
        lte: new Date(endDate)
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (professionalId) {
      whereClause.professionalId = professionalId;
    }

    if (patientId) {
      whereClause.patientId = patientId;
    }

    // Buscar agendamentos com paginação
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: {
        scheduledDate: 'asc'
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    // Contar total de agendamentos para paginação
    const total = await prisma.appointment.count({
      where: whereClause
    });

    res.json({
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: error.message });
  }
});

// Obter um agendamento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
        organizationId
      },
      include: {
        patient: true,
        medicalRecord: {
          select: {
            id: true,
            recordType: true,
            recordDate: true,
            status: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message });
  }
});

// Criar um novo agendamento
router.post('/', async (req, res) => {
  try {
    const { organizationId } = req.user;
    const {
      professionalId,
      patientId,
      scheduledDate,
      duration,
      status,
      type,
      notes,
      createdVia
    } = req.body;

    // Validar dados obrigatórios
    if (!professionalId || !patientId || !scheduledDate) {
      return res.status(400).json({ message: 'Profissional, paciente e data são obrigatórios' });
    }

    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId, organizationId }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    // Verificar se o profissional existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId, organizationId }
    });

    if (!professional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    // Verificar disponibilidade do horário
    const scheduledDateTime = new Date(scheduledDate);
    const endTime = new Date(scheduledDateTime.getTime() + (duration || 30) * 60000);

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId,
        organizationId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        OR: [
          {
            // Novo agendamento começa durante um existente
            scheduledDate: {
              lt: endTime
            },
            AND: {
              scheduledDate: {
                gte: scheduledDateTime
              }
            }
          },
          {
            // Novo agendamento termina durante um existente
            scheduledDate: {
              lte: scheduledDateTime
            },
            AND: {
              // Calculando o fim do agendamento existente
              scheduledDate: {
                gt: scheduledDateTime
              }
            }
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        message: 'Horário indisponível. Já existe um agendamento neste horário.',
        conflictingAppointment
      });
    }

    // Criar o agendamento
    const appointment = await prisma.appointment.create({
      data: {
        organizationId,
        professionalId,
        patientId,
        scheduledDate: scheduledDateTime,
        duration: duration || 30,
        status: status || 'SCHEDULED',
        type,
        notes,
        createdVia: createdVia || 'dashboard'
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro ao criar agendamento', error: error.message });
  }
});

// Atualizar um agendamento existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const {
      professionalId,
      scheduledDate,
      duration,
      status,
      type,
      notes
    } = req.body;

    // Verificar se o agendamento existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar permissões
    if (existingAppointment.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este agendamento' });
    }

    // Verificar disponibilidade do horário se a data ou profissional for alterado
    if ((scheduledDate && new Date(scheduledDate).getTime() !== new Date(existingAppointment.scheduledDate).getTime()) || 
        (professionalId && professionalId !== existingAppointment.professionalId)) {
      
      const newScheduledDateTime = scheduledDate ? new Date(scheduledDate) : existingAppointment.scheduledDate;
      const newDuration = duration || existingAppointment.duration;
      const newEndTime = new Date(newScheduledDateTime.getTime() + newDuration * 60000);
      const newProfessionalId = professionalId || existingAppointment.professionalId;

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          professionalId: newProfessionalId,
          organizationId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          OR: [
            {
              scheduledDate: {
                lt: newEndTime
              },
              AND: {
                scheduledDate: {
                  gte: newScheduledDateTime
                }
              }
            },
            {
              scheduledDate: {
                lte: newScheduledDateTime
              },
              AND: {
                scheduledDate: {
                  gt: newScheduledDateTime
                }
              }
            }
          ]
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ 
          message: 'Horário indisponível. Já existe um agendamento neste horário.',
          conflictingAppointment
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (professionalId) updateData.professionalId = professionalId;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (duration) updateData.duration = duration;
    if (status) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;

    // Atualizar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar agendamento', error: error.message });
  }
});

// Cancelar um agendamento
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { reason } = req.body;

    // Verificar se o agendamento existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar permissões
    if (existingAppointment.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este agendamento' });
    }

    // Verificar se o agendamento já foi cancelado
    if (existingAppointment.status === 'CANCELED') {
      return res.status(400).json({ message: 'Este agendamento já foi cancelado' });
    }

    // Verificar se o agendamento já foi concluído
    if (existingAppointment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Não é possível cancelar um agendamento já concluído' });
    }

    // Cancelar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELED',
        notes: reason ? `${existingAppointment.notes || ''}\nMotivo do cancelamento: ${reason}` : existingAppointment.notes
      }
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ message: 'Erro ao cancelar agendamento', error: error.message });
  }
});

// Confirmar um agendamento
router.put('/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Verificar se o agendamento existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    // Verificar permissões
    if (existingAppointment.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Acesso não autorizado a este agendamento' });
    }

    // Verificar se o agendamento já foi cancelado ou concluído
    if (existingAppointment.status === 'CANCELED') {
      return res.status(400).json({ message: 'Não é possível confirmar um agendamento cancelado' });
    }

    if (existingAppointment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Este agendamento já foi concluído' });
    }

    // Confirmar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CONFIRMED'
      }
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    res.status(500).json({ message: 'Erro ao confirmar agendamento', error: error.message });
  }
});

// Obter disponibilidade de horários
router.get('/availability/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { organizationId } = req.user;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Data é obrigatória' });
    }

    // Verificar se o profissional existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId, organizationId }
    });

    if (!professional) {
      return res.status(404).json({ message: 'Profissional não encontrado' });
    }

    // Converter a data para o início do dia
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    // Fim do dia
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    // Buscar agendamentos do profissional na data especificada
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        organizationId,
        scheduledDate: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ['SCHEDULED', 'CONFIRMED'] }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    // Horário de funcionamento padrão (8h às 18h)
    // Isso poderia vir das configurações da organização
    const workingHours = {
      start: 8,
      end: 18
    };

    // Duração padrão da consulta em minutos
    const defaultDuration = 30;

    // Gerar slots de horários disponíveis
    const availableSlots = [];
    const bookedSlots = appointments.map(app => ({
      start: new Date(app.scheduledDate),
      end: new Date(new Date(app.scheduledDate).getTime() + app.duration * 60000)
    }));

    // Gerar slots de 30 em 30 minutos
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += defaultDuration) {
        const slotStart = new Date(startDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + defaultDuration);

        // Verificar se o slot já passou
        if (slotStart < new Date()) {
          continue;
        }

        // Verificar se o slot está disponível
        const isAvailable = !bookedSlots.some(bookedSlot => 
          (slotStart >= bookedSlot.start && slotStart < bookedSlot.end) || 
          (slotEnd > bookedSlot.start && slotEnd <= bookedSlot.end) ||
          (slotStart <= bookedSlot.start && slotEnd >= bookedSlot.end)
        );

        if (isAvailable) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd
          });
        }
      }
    }

    res.json({
      date: startDate,
      professional: {
        id: professional.id,
        name: professional.name
      },
      bookedSlots,
      availableSlots
    });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    res.status(500).json({ message: 'Erro ao buscar disponibilidade', error: error.message });
  }
});

module.exports = router;