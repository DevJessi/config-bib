import { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, BookMarked, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import './Acervo.css';

interface Exemplar {
  id: string;
  codigoPatrimonio: string;
  disponivel: boolean;
}

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  editora?: string;
  ano?: number;
  capaUrl?: string;
  exemplares: Exemplar[];
}

interface Toast {
  mensagem: string;
  tipo: 'success' | 'error';
}

function getDisponibilidade(livro: Livro) {
  const total = livro.exemplares.length;
  const disponiveis = livro.exemplares.filter((e) => e.disponivel).length;
  if (disponiveis > 0) {
    return {
      status: 'disponivel',
      texto: `${disponiveis} ${disponiveis === 1 ? 'disponível' : 'disponíveis'}`,
    };
  }
  return { status: 'indisponivel', texto: total === 0 ? 'Sem exemplares' : 'Indisponível' };
}

export default function Acervo() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  function showToast(mensagem: string, tipo: Toast['tipo']) {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchLivros = useCallback(async () => {
    setCarregando(true);
    try {
      const params: Record<string, string> = {};
      if (busca) params.busca = busca;
      if (categoria) params.categoria = categoria;
      const { data } = await api.get<Livro[]>('/livros', { params });
      setLivros(data);
    } catch {
      showToast('Erro ao carregar o acervo. Tente novamente.', 'error');
    } finally {
      setCarregando(false);
    }
  }, [busca, categoria]);

  useEffect(() => {
    const id = setTimeout(fetchLivros, 400);
    return () => clearTimeout(id);
  }, [fetchLivros]);

  async function handleReservar(livroId: string) {
    setProcessando(livroId);
    try {
      await api.post('/reservas', { livroId });
      showToast('Reserva realizada com sucesso!', 'success');
      fetchLivros();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg ?? 'Erro ao realizar a reserva.', 'error');
    } finally {
      setProcessando(null);
    }
  }

  const categorias = Array.from(new Set(livros.map((l) => l.categoria))).filter(Boolean).sort();

  return (
    <main className="acervo-page">
      <div className="acervo-header">
        <h1 className="acervo-title">Acervo</h1>
        <p className="acervo-subtitle">Pesquise e reserve livros disponíveis na biblioteca.</p>
      </div>

      <div className="acervo-search-bar" role="search">
        <div className="acervo-search-wrapper">
          <Search size={18} className="acervo-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="acervo-search-input"
            placeholder="Buscar por título, autor ou ISBN..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar livros no acervo"
          />
        </div>
        <select
          className="acervo-filter-select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {!carregando && (
        <p className="acervo-stats" aria-live="polite">
          {livros.length} {livros.length === 1 ? 'título encontrado' : 'títulos encontrados'}
        </p>
      )}

      <section className="acervo-grid" aria-label="Lista de livros do acervo">
        {carregando ? (
          <div className="acervo-loading" aria-live="polite" aria-label="Carregando acervo...">
            <BookOpen size={40} strokeWidth={1.5} />
            <p>Carregando acervo...</p>
          </div>
        ) : livros.length === 0 ? (
          <div className="acervo-empty">
            <BookOpen size={48} strokeWidth={1} className="acervo-empty-icon" aria-hidden="true" />
            <p className="acervo-empty-text">Nenhum livro encontrado com os filtros informados.</p>
          </div>
        ) : (
          livros.map((livro) => {
            const { status, texto } = getDisponibilidade(livro);
            const disponivel = status === 'disponivel';
            return (
              <article key={livro.id} className="livro-card" aria-label={`Livro: ${livro.titulo}`}>
                <div className="livro-cover" role="img" aria-label={`Capa de ${livro.titulo}`}>
                  {livro.capaUrl ? (
                    <img src={livro.capaUrl} alt="" />
                  ) : (
                    <>
                      <BookOpen size={42} strokeWidth={1.4} aria-hidden="true" />
                      <span>{livro.titulo.slice(0, 1).toUpperCase()}</span>
                    </>
                  )}
                </div>
                <div className="livro-card-content">
                <div className="livro-card-top">
                  <span className={`livro-badge ${status}`} aria-label={`Status: ${texto}`}>
                    {texto}
                  </span>
                  {disponivel
                    ? <CheckCircle size={18} color="#16A34A" aria-hidden="true" />
                    : <XCircle size={18} color="#DC2626" aria-hidden="true" />}
                </div>
                <h2 className="livro-titulo">{livro.titulo}</h2>
                <p className="livro-autor">{livro.autor}</p>
                <dl className="livro-meta">
                  <div><dt>Categoria</dt><dd>{livro.categoria || 'Não informada'}</dd></div>
                  <div><dt>Editora</dt><dd>{livro.editora || 'Não informada'}</dd></div>
                  <div><dt>Ano</dt><dd>{livro.ano || 'Não informado'}</dd></div>
                  <div><dt>ISBN</dt><dd>{livro.isbn}</dd></div>
                </dl>
                {!disponivel && (
                  <div className="livro-actions">
                    <button
                      className="btn-primary"
                      onClick={() => handleReservar(livro.id)}
                      disabled={processando === livro.id}
                      aria-label={`Solicitar reserva de ${livro.titulo}`}
                    >
                      <BookMarked size={15} aria-hidden="true" />
                      {processando === livro.id ? 'Solicitando...' : 'Solicitar Reserva'}
                    </button>
                  </div>
                )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {toast && (
        <div className={`toast ${toast.tipo}`} role="status" aria-live="assertive">
          {toast.tipo === 'success'
            ? <CheckCircle size={16} aria-hidden="true" />
            : <XCircle size={16} aria-hidden="true" />}
          {toast.mensagem}
        </div>
      )}
    </main>
  );
}
