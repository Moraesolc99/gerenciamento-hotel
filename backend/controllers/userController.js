const db = require('../models');

const listAll = async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acesso negado.' });

    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
};

const getById = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

const update = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await user.update(req.body);
    res.json({ message: 'Usuário atualizado com sucesso', user });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
};

const remove = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await user.destroy();
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
};

module.exports = { listAll, getById, update, remove };
