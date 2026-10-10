import { useEffect, useState } from 'react';
import { Search, DollarSign, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './QuitacaoMultas.css';

interface MultaDetalhe {
  emprestimoId: string;
  livroTitulo: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  diasAtraso: number;
  valor: number;
}

interface LeitorComMulta {
  leitorId: string;
  nome: string;
  email: string;
  statusLeitor: string;
  multaTotal: number;
  multas: MultaDetalhe[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function QuitacaoMultas() {
  const [leitores, setLeitores] = useState<LeitorComMulta[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [quitando, setQuitando] = useState<string | null>(null);
  const [quitados, setQuitados] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchMultas() {
      setCarregando(true);
      try {
        const params: Record<string, string> = {};
        if (busca) params.busca = busca;
        const { data } = await api.get<LeitorComMulta[]>('/multas/pendentes', { params });
        setLeitores(data);
      } catch {
        /* silencioso */
      } finally {
        setCarregando(false);
      }
    }
    const id = setTimeout(fetchMultas, 350);
    return () => clearTimeout(id);
  }, [busca]);

  async function handleQuitar(leitorId: string) {
    setQuitando(leitorId);
    try {
      await api.post(`/multas/${leitorId}/quitar`);
      setQuitados((prev) => new Set([...prev, leitorId]));
    } catch {
      /* silencioso */
    } finally {
      setQuitando(null);
    }
  }

  const leitoresTotais = leitores.filter((l) => !quitados.has(l.leitorId));

  return (
    <main className="quitacao-page">
      <h1 className="quitacao-title">Quitação de Multas</h1>
      <p className="quitacao-subtitle">
        Leitores com pendências financeiras. Bloqueio ativo para multas acima de R$&nbsp;20,00 (ADR-006). Quitação total remove o bloqueio.
      </p>

      <div className="quitacao-search-bar" role="search">
        <div className="quitacao-search-wrapper">
          <Search size={18} className="quitacao-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="quitacao-search-input"
            placeholder="Buscar leitor por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar leitor com multa pendente"
          />
        </div>
      </div>

      {carregando ? (
        <div className="quitacao-loading" aria-live="polite">
          <DollarSign size={40} strokeWidth={1.5} />
          <p>Carregando pendências...</p>
        </div>
      ) : leitoresTotais.length === 0 ? (
        <div className="quitacao-empty">
          <CheckCircle size={48} strokeWidth={1} style={{ display: 'block', margin: '0 auto 1rem', color: '#16A34A' }} aria-hidden="true" />
          <p style={{ color: '#16A34A', fontWeight: 600 }}>Nenhuma multa pendente no momento.</p>
        </div>
      ) : (
        <div className="quitacao-lista" aria-label="Lista de leitores com multas pendentes">
          {leitoresTotais.map((leitor) => (
            <article key={leitor.leitorId} className="quitacao-card" aria-label={`Leitor: ${leitor.nome}`}>
              <div className="quitacao-card-header">
                <div className="quitacao-leitor-info">
                  <h2>{leitor.nome}</h2>
                  <p>{leitor.email}</p>
                  {leitor.statusLeitor === 'BLOQUEADO_MULTA' && (
                    <span className="bloqueado-chip" aria-label="Leitor bloqueado por multa">BLOQUEADO</span>
                  )}
                </div>
                <span className="quitacao-multa-total" aria-label={`Total de multa: R$ ${leitor.multaTotal.toFixed(2)}`}>
                  R$&nbsp;{leitor.multaTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="quitacao-multas-detalhe">
                {leitor.multas.map((m) => (
                  <div key={m.emprestimoId} className="quitacao-multa-row">
                    <div className="quitacao-multa-desc">
                      {m.livroTitulo}
                      <small>
                        Previsto: {fmt(m.dataDevolucaoPrevista)}
                        {m.dataDevolucaoReal && ` · Devolvido: ${fmt(m.dataDevolucaoReal)}`}
                        {` · ${m.diasAtraso} dia${m.diasAtraso !== 1 ? 's' : ''} de atraso`}
                      </small>
                    </div>
                    <span className="quitacao-multa-valor">R$&nbsp;{m.valor.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              <div className="quitacao-card-footer">
                <button
                  className="btn-quitar"
                  onClick={() => handleQuitar(leitor.leitorId)}
                  disabled={quitando === leitor.leitorId}
                  aria-label={`Quitar total de R$ ${leitor.multaTotal.toFixed(2)} de ${leitor.nome}`}
                  aria-busy={quitando === leitor.leitorId}
                >
                  <CheckCircle size={15} aria-hidden="true" />
                  {quitando === leitor.leitorId ? 'Processando...' : `Quitar R$ ${leitor.multaTotal.toFixed(2).replace('.', ',')}`}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
