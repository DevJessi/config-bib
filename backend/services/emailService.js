import env from '../infra/env.js';
import { transporter, emailConfigurado } from '../infra/mailer.js';
import { logAviso, logErro, logInfo } from '../infra/logger.js';

const NOME_BIBLIOTECA = 'Biblioteca Paulo Renato de Souza';
const FUSO_HORARIO = 'America/Sao_Paulo';

// Tudo que vem do usuário (nome, e-mail) passa por aqui antes de entrar no HTML do e-mail
function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Ex.: "13/10/2026 às 14:35"
function formatarDataHora(data) {
  const momento = new Date(data);
  const dia = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: FUSO_HORARIO }).format(momento);
  const hora = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short', timeZone: FUSO_HORARIO }).format(momento);
  return `${dia} às ${hora}`;
}

// Ex.: "27/10/2026" (data no fuso de Brasília)
function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: FUSO_HORARIO,
  }).format(new Date(data));
}

// Layout único dos e-mails, com as cores da biblioteca. Usa tabela e estilos inline
// porque é o que funciona em Gmail/Outlook (eles ignoram <style> e CSS moderno).
function montarHtml({ titulo, paragrafos, botao }) {
  const corpo = paragrafos
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1A1A2E;">${p}</p>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background-color:#F8F7FF;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F7FF;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid #E0E4FF;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background-color:#274DEA;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold;">${NOME_BIBLIOTECA}</td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1A1A2E;">${titulo}</h1>
              ${corpo}
              <a href="${escaparHtml(botao.url)}" style="display:inline-block;margin-top:8px;background-color:#6178FC;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px;">${botao.texto}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background-color:#F8F7FF;color:#6B7280;font-size:12px;line-height:1.5;">
              Este é um e-mail automático da ${NOME_BIBLIOTECA}. Por favor, não responda a esta mensagem.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function enviarEmail({ para, assunto, texto, html }) {
  if (!emailConfigurado) {
    logAviso('email.nao_configurado', { assunto });
    return false;
  }

  await transporter.sendMail({
    from: `"${NOME_BIBLIOTECA}" <${env.emailUsuario}>`,
    to: para,
    subject: assunto,
    text: texto,
    html,
  });
  return true;
}

export async function verificarConexaoEmail() {
  if (!emailConfigurado) {
    logAviso('email.nao_configurado_na_subida', {
      dica: 'Defina EMAIL_USUARIO e EMAIL_SENHA para enviar e-mails. O cadastro e o login funcionam sem eles.',
    });
    return;
  }

  try {
    await transporter.verify();
    logInfo('email.conexao_ok');
  } catch (error) {
    logErro('email.conexao_falhou', error, {
      dica: 'Confira EMAIL_USUARIO e a senha de app do Gmail (EMAIL_SENHA, 16 letras; não é a senha normal da conta)',
    });
  }
}

// E-mail 1: avisa que o cadastro deu certo
export function enviarBoasVindas({ nome, email }) {
  const urlLogin = `${env.frontendUrl}/login`;

  const texto = [
    `Olá, ${nome}!`,
    '',
    `Seu cadastro na ${NOME_BIBLIOTECA} foi realizado com sucesso.`,
    `Agora você já pode entrar com o e-mail ${email} para consultar o acervo, reservar livros e acompanhar seus empréstimos.`,
    '',
    `Acessar a biblioteca: ${urlLogin}`,
    '',
    'Se você não fez este cadastro, entre em contato com a biblioteca.',
  ].join('\n');

  const html = montarHtml({
    titulo: 'Cadastro realizado com sucesso!',
    paragrafos: [
      `Olá, <strong>${escaparHtml(nome)}</strong>!`,
      `Seu cadastro na ${NOME_BIBLIOTECA} foi concluído com sucesso. Agora você já pode entrar com o e-mail <strong>${escaparHtml(email)}</strong> para consultar o acervo, reservar livros e acompanhar seus empréstimos.`,
      'Se você não fez este cadastro, entre em contato com a biblioteca.',
    ],
    botao: { texto: 'Entrar na biblioteca', url: urlLogin },
  });

  return enviarEmail({
    para: email,
    assunto: `Cadastro realizado com sucesso — ${NOME_BIBLIOTECA}`,
    texto,
    html,
  });
}

// E-mail 2: lembretes automáticos de devolução (faltando 2 dias, faltando 1 dia e no último dia)
// diasRestantes: 2, 1 ou 0 (dataDevolucao: prazo final do empréstimo)
export function enviarLembreteDevolucao({ nome, email }, { titulo, dataDevolucao, diasRestantes }) {
  const urlSite = `${env.frontendUrl}/meu-perfil`;
  const data = formatarData(dataDevolucao);

  // Mensagem curta (texto puro) que muda conforme faltam 2 dias, 1 dia ou é o último dia
  let assunto;
  let tituloEmail;
  let aviso;
  if (diasRestantes === 0) {
    tituloEmail = 'Hoje é o último dia para devolver o livro';
    assunto = `Hoje é o último dia para devolver "${titulo}" — ${NOME_BIBLIOTECA}`;
    aviso = `Hoje, ${data}, é o último dia para devolver o livro "${titulo}".`;
  } else {
    const prazo = diasRestantes === 1 ? 'Falta 1 dia' : `Faltam ${diasRestantes} dias`;
    tituloEmail = `${prazo} para devolver o livro`;
    assunto = `${prazo} para devolver "${titulo}" — ${NOME_BIBLIOTECA}`;
    aviso = `${prazo} para devolver o livro "${titulo}". A data de devolução é ${data}.`;
  }

  const texto = [
    `Olá, ${nome}!`,
    '',
    aviso,
    'Devolva o livro no prazo para evitar multa por atraso.',
    '',
    `Ver meus empréstimos: ${urlSite}`,
  ].join('\n');

  const html = montarHtml({
    titulo: tituloEmail,
    paragrafos: [
      `Olá, <strong>${escaparHtml(nome)}</strong>!`,
      escaparHtml(aviso),
      'Devolva o livro no prazo para evitar multa por atraso.',
    ],
    botao: { texto: 'Ver meus empréstimos', url: urlSite },
  });

  return enviarEmail({ para: email, assunto, texto, html });
}

// E-mail 3: confirmação de que a devolução foi registrada
// multa/diasAtraso só vêm preenchidos quando a devolução foi depois do prazo
export function enviarDevolucaoConfirmada({ nome, email }, { titulo, devolvidoEm, multa, diasAtraso }) {
  const urlSite = `${env.frontendUrl}/acervo`;
  const quando = formatarDataHora(devolvidoEm);
  const temMulta = Number(multa) > 0;
  const valorMulta = `R$ ${Number(multa).toFixed(2).replace('.', ',')}`;
  const textoAtraso = `A devolução foi feita com ${diasAtraso} dia${diasAtraso === 1 ? '' : 's'} de atraso e gerou uma multa de ${valorMulta}. Procure a biblioteca para quitá-la.`;

  const texto = [
    `Olá, ${nome}!`,
    '',
    `A devolução do livro "${titulo}" foi realizada com sucesso em ${quando}.`,
    ...(temMulta ? ['', textoAtraso] : []),
    '',
    'Obrigado por usar a biblioteca!',
    `Acessar a biblioteca: ${urlSite}`,
  ].join('\n');

  const html = montarHtml({
    titulo: 'Devolução realizada com sucesso',
    paragrafos: [
      `Olá, <strong>${escaparHtml(nome)}</strong>!`,
      `A devolução do livro <strong>${escaparHtml(titulo)}</strong> foi realizada com sucesso em <strong>${escaparHtml(quando)}</strong>.`,
      ...(temMulta ? [escaparHtml(textoAtraso)] : []),
      'Obrigado por usar a biblioteca!',
    ],
    botao: { texto: 'Abrir a biblioteca', url: urlSite },
  });

  return enviarEmail({
    para: email,
    assunto: `Devolução realizada com sucesso — ${NOME_BIBLIOTECA}`,
    texto,
    html,
  });
}
