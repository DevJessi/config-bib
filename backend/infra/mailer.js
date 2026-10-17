import nodemailer from 'nodemailer';
import env from './env.js';

const emailConfigurado = Boolean(env.emailUsuario && env.emailSenha);

const transporter = emailConfigurado
  ? nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      auth: {
        user: env.emailUsuario,
        pass: env.emailSenha,
      },
      secure: true
    })
  : null;

export { transporter, emailConfigurado };
