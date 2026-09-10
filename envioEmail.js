require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.senha,
    }
});

async function enviarEmail() {
  try {
    const info = await transporter.sendMail({
      from: '"Teste de Envio" <${process.env.email}>',
      to: "jessicasilvadsantos@gmail.com",
      subject: "Ola",
      text: "Envio concluído com sucesso",
    });

    console.log("sucesso");
  } catch (error) {
    console.error("erro");
  }
}

enviarEmail();