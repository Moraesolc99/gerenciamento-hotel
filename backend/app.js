const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./models');
const routesAuth = require('./routes/authRoutes');
const routesUser = require('./routes/userRoutes');
const routesRoom = require('./routes/roomRoutes');
const routesReservation = require('./routes/reservationRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', routesAuth);
app.use('/api/users', routesUser);
app.use('/api/rooms', routesRoom);
app.use('/api/reservations', routesReservation);

app.get('/api/health', (req, res) => res.json({ ok: true }));


async function syncDB() {
  try {
    await db.sequelize.sync({ /* force: true */ });
    console.log('Banco de dados sincronizado');
  } catch (err) {
    console.error('Erro ao sincronizar o banco:', err);
  }
}
syncDB();

module.exports = app;
