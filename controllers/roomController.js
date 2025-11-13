const db = require('../models');
const fetchCEP = require('../utils/cepService');

const listAll = async (req,res) => {
  const rooms = await db.Room.findAll();
  res.json(rooms);
};

const getById = async (req,res) => {
  const r = await db.Room.findByPk(req.params.id);
  if (!r) return res.status(404).json({ message: 'Não encontrado' });
  res.json(r);
};

const create = async (req,res) => {
  const body = req.body;
  if (body.cep) {
    try {
      const cepData = await fetchCEP(body.cep);
      if (cepData) {
        body.addressCEP = cepData.cep;
        body.addressStreet = cepData.street;
        body.addressNeighborhood = cepData.neighborhood;
        body.addressCity = cepData.city;
        body.addressState = cepData.state;
      }
    } catch(e) { console.log('CEP falhou', e.message); }
  }
  if (req.file) {
    body.imageUrl = `/uploads/${req.file.filename}`;
  }
  // tags se vierem em string separadas por vírgula
  if (typeof body.tags === 'string') body.tags = body.tags.split(',').map(t=>t.trim());
  const room = await db.Room.create(body);
  res.json(room);
};

const update = async (req,res) => {
  const room = await db.Room.findByPk(req.params.id);
  if (!room) return res.status(404).json({ message: 'Não encontrado' });
  if (req.file) req.body.imageUrl = `/uploads/${req.file.filename}`;
  if (typeof req.body.tags === 'string') req.body.tags = req.body.tags.split(',').map(t=>t.trim());
  await room.update(req.body);
  res.json(room);
};

const remove = async (req,res) => {
  const room = await db.Room.findByPk(req.params.id);
  if (!room) return res.status(404).json({ message: 'Não encontrado' });
  await room.destroy();
  res.json({ message: 'Removido' });
};

module.exports = { listAll, getById, create, update, remove };
