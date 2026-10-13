import { pool } from '../infra/database.js';
import { ErroHttp } from '../infra/erros.js';
import { comTransacao } from '../infra/transacao.js';
import { registrarAuditoria } from '../infra/auditoria.js';
import { sqlExemplarLivre } from '../infra/disponibilidade.js';
import { codigoDoExemplar, SQL_CODIGO } from '../infra/patrimonio.js';
import { padraoBusca, textoLimpo } from '../infra/validacao.js';

const MAX_EXEMPLARES_POR_CADASTRO = 50;

// GET /livros?busca=
// Colunas usadas das migrations: books(title, author, edition) e exemplars(volume, print_year)
// "editora" do front = books.edition e "ano" = menor exemplars.print_year. "disponivel" é calculado para o leitor logado
export async function listarLivros({ busca }, usuario) {
  const { rows } = await pool.query(
    `SELECT b.id, b.title, b.author, b.edition, MIN(e.print_year) AS ano,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', e.id,
                  'codigoPatrimonio', ${SQL_CODIGO('e')},
                  'disponivel', ${sqlExemplarLivre('e', '$2')}
                ) ORDER BY e."createdAt", e.id
              ) FILTER (WHERE e.id IS NOT NULL),
              '[]'::json
            ) AS exemplares
     FROM books b
     LEFT JOIN exemplars e ON e.books_id = b.id
     WHERE ($1::text IS NULL OR b.title ILIKE $1 OR b.author ILIKE $1)
     GROUP BY b.id
     ORDER BY b.title, b.id`,
    [padraoBusca(busca), usuario.id],
  );

  return rows.map((r) => ({
    id: r.id,
    titulo: r.title,
    autor: r.author,
    editora: r.edition ?? undefined,
    ano: r.ano ?? undefined,
    exemplares: r.exemplares,
  }));
}

function lerDadosDoLivro(corpo) {
  const titulo = textoLimpo(corpo?.titulo);
  const autor = textoLimpo(corpo?.autor);
  const editora = textoLimpo(corpo?.editora);
  if (!titulo || !autor) throw new ErroHttp(400, 'Informe o título e o autor do livro.');
  if (titulo.length > 300) throw new ErroHttp(400, 'O título pode ter no máximo 300 caracteres.');
  if (autor.length > 200) throw new ErroHttp(400, 'O autor pode ter no máximo 200 caracteres.');
  if (editora.length > 100) throw new ErroHttp(400, 'A edição/editora pode ter no máximo 100 caracteres.');

  let ano = null;
  if (corpo?.anoPublicacao !== undefined && corpo?.anoPublicacao !== null && corpo?.anoPublicacao !== '') {
    ano = Number(corpo.anoPublicacao);
    if (!Number.isInteger(ano) || ano < 1400 || ano > new Date().getFullYear()) {
      throw new ErroHttp(400, 'Informe um ano de impressão válido.');
    }
  }

  const exemplares = corpo?.exemplares;
  if (!Array.isArray(exemplares) || exemplares.length === 0) {
    throw new ErroHttp(400, 'Cadastre ao menos um exemplar.');
  }
  if (exemplares.length > MAX_EXEMPLARES_POR_CADASTRO) {
    throw new ErroHttp(400, `Cadastre no máximo ${MAX_EXEMPLARES_POR_CADASTRO} exemplares por vez.`);
  }
  const volumes = exemplares.map((ex) => {
    const volume = textoLimpo(ex?.volume);
    if (volume.length > 50) throw new ErroHttp(400, 'O volume pode ter no máximo 50 caracteres.');
    return volume || null;
  });

  return { titulo, autor, editora: editora || null, ano, volumes };
}

// Para bibliotecario
// POST /livros: cadastra o livro e um exemplar para cada item de `exemplares`
export async function cadastrarLivro(corpo, ator) {
  const dados = lerDadosDoLivro(corpo);

  return comTransacao(async (client) => {
    const livro = await client.query(
      'INSERT INTO books (title, author, edition) VALUES ($1, $2, $3) RETURNING id',
      [dados.titulo, dados.autor, dados.editora],
    );
    const livroId = livro.rows[0].id;

    const exemplares = [];
    for (const volume of dados.volumes) {
      const { rows } = await client.query(
        'INSERT INTO exemplars (books_id, volume, print_year) VALUES ($1, $2, $3) RETURNING id',
        [livroId, volume, dados.ano],
      );
      exemplares.push({ id: rows[0].id, codigoPatrimonio: codigoDoExemplar(rows[0].id) });
    }

    await registrarAuditoria(client, {
      operacao: 'book.created',
      ator,
      entidade: 'book',
      entidadeId: livroId,
      detalhes: { exemplares: exemplares.length },
    });

    return { id: livroId, titulo: dados.titulo, autor: dados.autor, exemplares };
  });
}
