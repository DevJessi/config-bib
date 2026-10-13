import { useEffect, useState, type FormEvent } from 'react';
import { Search, Plus, CheckSquare, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import './GestaoEmprestimos.css';

interface Emprestimo {
  id: string;
  leitor: { nome: string; email: string };
  livro: { titulo: string; autor: string };
  codigoPatrimonio: string;
  dataEmprestimo: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  status: 'ATIVO' | 'VENCIDO' | 'DEVOLVIDO';
  multa?: number;
}

interface RespostaNovoEmprestimo {
  livro: string;
  dataDevolucaoPrevista: string;
}

interface RespostaDevolucao {
  diasAtraso: number;
  multa: number;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function statusClass(s: string) {
  return s.toLowerCase();
}

export default function GestaoEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [devolvendo, setDevolvendo] = useState<string | null>(null);
  const [mostrarNovoForm, setMostrarNovoForm] = useState(false);

  const [novoLeitorId, setNovoLeitorId] = useState('');
  const [novoExemplarCod, setNovoExemplarCod] = useState('');
  const [criando, setCriando] = useState(false);
  const [erroNovo, setErroNovo] = useState('');
  const [sucessoNovo, setSucessoNovo] = useState('');
  const [mensagemLista, setMensagemLista] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  async function fetchEmprestimos() {
    setCarregando(true);
    try {
      const params: Record<string, string> = {};
      if (busca) params.busca = busca;
      if (filtroStatus) params.status = filtroStatus;
      const { data } = await api.get<Emprestimo[]>('/emprestimos', { params });
      setEmprestimos(data);
    } catch {
      setMensagemLista({ tipo: 'erro', texto: 'Não foi possível carregar os empréstimos.' });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(fetchEmprestimos, 350);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, filtroStatus]);

  async function handleDevolver(id: string) {
    setDevolvendo(id);
    setMensagemLista(null);
    try {
      const { data } = await api.post<RespostaDevolucao>(`/emprestimos/${id}/devolver`);
      const aviso = data.multa > 0
        ? ` Atraso de ${data.diasAtraso} dia(s): multa de R$ ${data.multa.toFixed(2).replace('.', ',')}.`
        : '';
      setMensagemLista({ tipo: 'ok', texto: `Devolução registrada. O leitor foi avisado por e-mail.${aviso}` });
      await fetchEmprestimos();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMensagemLista({ tipo: 'erro', texto: msg ?? 'Erro ao registrar a devolução.' });
    } finally {
      setDevolvendo(null);
    }
  }

  async function handleNovoEmprestimo(e: FormEvent) {
    e.preventDefault();
    if (!novoLeitorId.trim() || !novoExemplarCod.trim()) {
      setErroNovo('Preencha o e-mail (ou ID) do leitor e o código de patrimônio.');
      return;
    }
    setCriando(true);
    setErroNovo('');
    setSucessoNovo('');
    try {
      const { data } = await api.post<RespostaNovoEmprestimo>('/emprestimos', {
        leitorId: novoLeitorId.trim(),
        codigoPatrimonio: novoExemplarCod.trim(),
      });
      setSucessoNovo(`Empréstimo registrado: "${data.livro}". Devolução prevista até ${fmt(data.dataDevolucaoPrevista)}.`);
      setNovoLeitorId('');
      setNovoExemplarCod('');
      fetchEmprestimos();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErroNovo(msg ?? 'Erro ao registrar o empréstimo.');
    } finally {
      setCriando(false);
    }
  }

  return (
    <main className="gestao-page">
      <h1 className="gestao-title">Gestão de Empréstimos</h1>
      <p className="gestao-subtitle">Registre devoluções, consulte o histórico e crie novos empréstimos. Prazo padrão: 15 dias (ADR-001).</p>

      {mostrarNovoForm && (
        <div className="novo-emprestimo-form" id="novo-emprestimo-form" aria-label="Formulário de novo empréstimo">
          <h2 className="novo-emprestimo-title">Novo Empréstimo</h2>

          {erroNovo && <div style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: '0.75rem' }} role="alert">{erroNovo}</div>}
          {sucessoNovo && <div style={{ color: '#15803D', fontSize: '0.875rem', marginBottom: '0.75rem' }} role="status">{sucessoNovo}</div>}

          <form onSubmit={handleNovoEmprestimo} noValidate>
            <div className="novo-form-grid">
              <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label htmlFor="leitor-id" style={{ fontSize: '0.875rem', fontWeight: 600 }}>E-mail ou ID do Leitor</label>
                <input
                  id="leitor-id"
                  type="text"
                  className="gestao-search-input"
                  value={novoLeitorId}
                  onChange={(e) => setNovoLeitorId(e.target.value)}
                  placeholder="E-mail do leitor (ou UUID)"
                  required
                  aria-required="true"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}
                />
              </div>
              <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label htmlFor="patrimonio" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Código de Patrimônio</label>
                <input
                  id="patrimonio"
                  type="text"
                  className="gestao-search-input"
                  value={novoExemplarCod}
                  onChange={(e) => setNovoExemplarCod(e.target.value)}
                  placeholder="Ex: PAT-1A2B3C4D"
                  required
                  aria-required="true"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8125rem' }}
                />
              </div>
              <div />
              <button type="submit" className="gestao-btn-novo" disabled={criando} aria-busy={criando}>
                <Plus size={16} aria-hidden="true" />
                {criando ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {mensagemLista && (
        <div
          style={{ color: mensagemLista.tipo === 'ok' ? '#15803D' : '#DC2626', fontSize: '0.875rem', marginBottom: '1rem' }}
          role={mensagemLista.tipo === 'ok' ? 'status' : 'alert'}
        >
          {mensagemLista.texto}
        </div>
      )}

      <div className="gestao-toolbar">
        <div className="gestao-search-wrapper">
          <Search size={18} className="gestao-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="gestao-search-input"
            placeholder="Buscar por leitor ou livro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar empréstimos"
          />
        </div>
        <select
          className="gestao-filter-select"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="VENCIDO">Vencido</option>
          <option value="DEVOLVIDO">Devolvido</option>
        </select>
        <button
          className="gestao-btn-novo"
          onClick={() => { setMostrarNovoForm((v) => !v); setSucessoNovo(''); setErroNovo(''); }}
          aria-expanded={mostrarNovoForm}
          aria-controls="novo-emprestimo-form"
        >
          <Plus size={16} aria-hidden="true" />
          Novo Empréstimo
        </button>
      </div>

      <div className="gestao-table-wrap">
        {carregando ? (
          <div className="gestao-loading" aria-live="polite">
            <ClipboardList size={40} strokeWidth={1.5} />
            <p>Carregando empréstimos...</p>
          </div>
        ) : emprestimos.length === 0 ? (
          <div className="gestao-empty">Nenhum empréstimo encontrado.</div>
        ) : (
          <table className="gestao-table" aria-label="Tabela de empréstimos">
            <thead>
              <tr>
                <th scope="col">Leitor</th>
                <th scope="col">Livro</th>
                <th scope="col">Patrimônio</th>
                <th scope="col">Empréstimo</th>
                <th scope="col">Devolução Prevista</th>
                <th scope="col">Status</th>
                <th scope="col">Multa</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="td-titulo">{emp.leitor.nome}</div>
                    <div className="td-autor">{emp.leitor.email}</div>
                  </td>
                  <td>
                    <div className="td-titulo">{emp.livro.titulo}</div>
                    <div className="td-autor">{emp.livro.autor}</div>
                  </td>
                  <td className="td-mono">{emp.codigoPatrimonio}</td>
                  <td className="td-mono">{fmt(emp.dataEmprestimo)}</td>
                  <td className="td-mono">{fmt(emp.dataDevolucaoPrevista)}</td>
                  <td>
                    <span className={`status-badge ${statusClass(emp.status)}`} aria-label={`Status: ${emp.status}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="td-mono" style={{ color: emp.multa && emp.multa > 0 ? '#DC2626' : '#6B7280' }}>
                    {emp.multa && emp.multa > 0 ? `R$ ${emp.multa.toFixed(2).replace('.', ',')}` : '—'}
                  </td>
                  <td>
                    {emp.status !== 'DEVOLVIDO' && (
                      <button
                        className="btn-devolver"
                        onClick={() => handleDevolver(emp.id)}
                        disabled={devolvendo === emp.id}
                        aria-label={`Registrar devolução de ${emp.livro.titulo}`}
                        aria-busy={devolvendo === emp.id}
                      >
                        <CheckSquare size={13} aria-hidden="true" />
                        {devolvendo === emp.id ? '...' : 'Devolver'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
