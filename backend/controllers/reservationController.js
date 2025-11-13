const db = require('../models');
const { Op } = require('sequelize');

// Calcula a quantidade de dias entre check-in e check-out
function daysBetween(a, b) {
  const da = new Date(a);
  const dbd = new Date(b);
  const diff = (dbd - da) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(diff));
}

// Verifica se o quarto está disponível no período
async function isRoomAvailable(roomId, checkIn, checkOut, excludeReservationId = null) {
  const clashes = await db.Reservation.findOne({
    where: {
      roomId,
      ...(excludeReservationId && { id: { [Op.ne]: excludeReservationId } }),
      [Op.or]: [
        { checkIn: { [Op.between]: [checkIn, checkOut] } },
        { checkOut: { [Op.between]: [checkIn, checkOut] } },
        {
          [Op.and]: [
            { checkIn: { [Op.lte]: checkIn } },
            { checkOut: { [Op.gte]: checkOut } }
          ]
        }
      ]
    }
  });
  return !clashes;
}

// Cria uma nova reserva
const create = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut)
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

    const room = await db.Room.findByPk(roomId);
    if (!room)
      return res.status(404).json({ message: 'Quarto não encontrado.' });

    if (new Date(checkOut) <= new Date(checkIn))
      return res.status(400).json({ message: 'Datas inválidas.' });

    const available = await isRoomAvailable(roomId, checkIn, checkOut);
    if (!available)
      return res.status(400).json({
        message: '⚠️ Este quarto já está reservado em parte ou todo o período selecionado.'
      });

    const nights = daysBetween(checkIn, checkOut);
    const totalPrice = (parseFloat(room.pricePerNight) * nights).toFixed(2);

    const reservation = await db.Reservation.create({
      userId: req.user.id,
      roomId,
      checkIn,
      checkOut,
      totalPrice
    });

    return res.status(201).json(reservation);
  } catch (err) {
    console.error('Erro ao criar reserva:', err);
    return res.status(500).json({ error: 'Erro interno ao criar reserva.' });
  }
};

// Lista reservas do usuário logado
const myReservations = async (req, res) => {
  try {
    const list = await db.Reservation.findAll({
      where: { userId: req.user.id },
      include: [db.Room]
    });
    res.json(list);
  } catch (err) {
    console.error('Erro ao listar reservas do usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar reservas.' });
  }
};

// Lista todas as reservas (somente admin)
const allReservations = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acesso negado.' });

    const list = await db.Reservation.findAll({
      include: [db.Room, db.User]
    });
    res.json(list);
  } catch (err) {
    console.error('Erro ao listar todas as reservas:', err);
    res.status(500).json({ error: 'Erro ao buscar reservas.' });
  }
};

// Atualiza uma reserva (somente admin)
const update = async (req, res) => {
  try {
    // Bloqueia usuários comuns
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem alterar reservas.' });
    }

    const reservation = await db.Reservation.findByPk(req.params.id);
    if (!reservation)
      return res.status(404).json({ message: 'Reserva não encontrada.' });

    const { checkIn, checkOut } = req.body;
    if (new Date(checkOut) <= new Date(checkIn))
      return res.status(400).json({ message: 'Datas inválidas.' });

    const available = await isRoomAvailable(
      reservation.roomId,
      checkIn,
      checkOut,
      reservation.id
    );

    if (!available)
      return res.status(400).json({ message: '⚠️ Conflito de datas.' });

    const nights = daysBetween(checkIn, checkOut);
    const room = await db.Room.findByPk(reservation.roomId);
    const totalPrice = (parseFloat(room.pricePerNight) * nights).toFixed(2);

    await reservation.update({ checkIn, checkOut, totalPrice });
    res.json(reservation);
  } catch (err) {
    console.error('Erro ao atualizar reserva:', err);
    res.status(500).json({ error: 'Erro ao atualizar reserva.' });
  }
};

// Remove uma reserva (somente admin ou dono)
const remove = async (req, res) => {
  try {
    const reservation = await db.Reservation.findByPk(req.params.id);
    if (!reservation)
      return res.status(404).json({ message: 'Reserva não encontrada.' });

    if (req.user.role !== 'admin' && reservation.userId !== req.user.id)
      return res.status(403).json({ message: 'Sem permissão para excluir.' });

    await reservation.destroy();
    res.json({ message: 'Reserva removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover reserva:', err);
    res.status(500).json({ error: 'Erro ao excluir reserva.' });
  }
};

module.exports = { create, myReservations, allReservations, update, remove };
