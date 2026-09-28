const prisma = require('../prisma');

exports.criar = (dados) => prisma.usuario.create({
  data: dados,
  select: { id: true, nome: true, email: true, papel: true },
});

exports.buscarEmail = (email) => prisma.usuario.findUnique({ where: { email } });