const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    console.log("🔹 Dados recebidos no register:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Preencha todos os campos.' });

    const existing = await db.User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: 'Email já registrado.' });

    const hashed = await bcrypt.hash(password.trim(), 10);
    console.log("🔹 Hash gerado:", hashed);

    const newUser = await db.User.create({
      name,
      email,
      password: hashed,
      role: 'user'
    });

    console.log("Usuário criado com hash:", newUser.password);

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({
      message: 'Erro interno no registro.',
      error: err.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentando login:', { email, password });

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      console.log('Usuário não encontrado.');
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('🔹 Hash salvo no BD:', user.password);
    console.log('🔹 Senha digitada:', password);

    const valid = await bcrypt.compare(password.trim(), user.password.trim());
    console.log('Resultado bcrypt.compare:', valid);

    if (!valid) {
      console.log('Senha incorreta para o email:', email);
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    );

    console.log('Login bem-sucedido para:', user.email);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno no login.' });
  }
};

module.exports = { register, login };
