import nodemailer from 'nodemailer';
import env from './env.js';

const emailConfigurado = Boolean(env.emailUsuario && env.emailSenha);

const transporter = emailConfigurado
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.emailUsuario,
        pass: env.emailSenha,
      },
    })
  : null;

export { transporter, emailConfigurado };
