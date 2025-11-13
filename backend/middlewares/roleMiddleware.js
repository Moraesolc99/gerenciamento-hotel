const ensureAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Apenas admin' });
  next();
};
module.exports = { ensureAdmin };