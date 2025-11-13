const db = require('./models');

async function seed(){
  await db.sequelize.sync();
  const exists = await db.User.findOne({ where: { email: 'admin@hotel.com' }});
  if (!exists){
    const admin = await db.User.create({ name: 'Admin', email: 'admin@hotel.com', password: 'admin123', role: 'admin' });
    console.log('Admin criado', admin.email);
  } else console.log('Admin already exists');
  process.exit();
}
seed();
