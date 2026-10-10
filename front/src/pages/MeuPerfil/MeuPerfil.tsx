import { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, CheckCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ModalLgpd from '../../components/ModalLgpd/ModalLgpd';
import api from '../../services/api';
import './MeuPerfil.css';

interface Emprestimo {
  id: string;
  livro: { titulo: string; autor: string };
  dataEmprestimo: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  status: 'ATIVO' | 'DEVOLVIDO' | 'VENCIDO';
  multa?: number;
}

interface PerfilData {
  multaTotal: number;
  statusLeitor: string;
  emprestimos: Emprestimo[];
}

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function getStatusClass(status: string) {
  if (status === 'ATIVO') return 'ativo';
  if (status === 'DEVOLVIDO') return 'devolvido';
  return 'vencido';
}

export default function MeuPerfil() {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalLgpdAberto, setModalLgpdAberto] = useState(false);
  const [lgpdSucesso, setLgpdSucesso] = useState(false);
  const [renovando, setRenovando] = useState<string | null>(null);
  const [mensagemRenovacao, setMensagemRenovacao] = useState('');

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const { data } = await api.get<PerfilData>('/leitores/me/perfil');
        setPerfil(data);
      } catch {
        /* erro silencioso — exibe tela vazia */
      } finally {
        setCarregando(false);
      }
    }
    fetchPerfil();
  }, []);

  async function handleRenovar(emprestimoId: string) {
    setRenovando(emprestimoId);
    setMensagemRenovacao('');
    try {
      await api.post(`/emprestimos/${emprestimoId}/renovar`);
      setMensagemRenovacao('Empréstimo renovado com sucesso por mais 15 dias!');
      const { data } = await api.get<PerfilData>('/leitores/me/perfil');
      setPerfil(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('reserva') || msg.toLowerCase().includes('fila')) {
        setMensagemRenovacao('Renovação negada: outro leitor reservou este livro e está aguardando na fila.');
      } else {
        setMensagemRenovacao('Não foi possível renovar o empréstimo. Tente novamente.');
      }
    } finally {
      setRenovando(null);
    }
  }

  function handleLgpdConfirmado() {
    setModalLgpdAberto(false);
    setLgpdSucesso(true);
  }

  const bloqueado = perfil && (perfil.multaTotal > 20 || perfil.statusLeitor === 'BLOQUEADO_MULTA');

  return (
    <main className="perfil-page">
      <h1 className="perfil-title">Meu Perfil</h1>

      <div className="perfil-grid">
        <aside>
          <div className="perfil-card">
            <div className="perfil-avatar" aria-hidden="true">
              {usuario ? iniciais(usuario.nome) : '??'}
            </div>
            <h2 className="perfil-nome">{usuario?.nome}</h2>
            <p className="perfil-email">{usuario?.email}</p>
            <span className="perfil-role-badge">{usuario?.papel}</span>

            {perfil && (
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
                Multa total: <strong style={{ color: perfil.multaTotal > 0 ? '#DC2626' : '#16A34A' }}>
                  R$ {perfil.multaTotal.toFixed(2).replace('.', ',')}
                </strong>
              </p>
            )}

            <div className="perfil-divider" />

            {lgpdSucesso ? (
              <div className="lgpd-success" role="status">
                <CheckCircle size={16} aria-hidden="true" />
                Solicitação registrada. Seus dados serão expurgados em até 48h.
              </div>
            ) : (
              <button
                className="btn-lgpd"
                onClick={() => setModalLgpdAberto(true)}
                aria-label="Solicitar exclusão dos meus dados conforme a LGPD"
              >
                <Trash2 size={15} aria-hidden="true" />
                Solicitar Exclusão (LGPD)
              </button>
            )}
          </div>
        </aside>

        <section aria-label="Histórico de empréstimos">
          {bloqueado && (
            <div className="bloqueio-banner" role="alert">
              <AlertTriangle size={22} className="bloqueio-banner-icon" aria-hidden="true" />
              <div>
                <p className="bloqueio-banner-title">Conta Bloqueada por Pendência Financeira</p>
                <p className="bloqueio-banner-text">
                  Você possui multa superior a R$&nbsp;20,00 (total: <strong>R$&nbsp;{perfil?.multaTotal.toFixed(2).replace('.', ',')}</strong>).
                  Novos empréstimos e reservas estão bloqueados até a quitação total das pendências.
                  Procure a biblioteca para regularizar sua situação.
                </p>
              </div>
            </div>
          )}

          {mensagemRenovacao && (
            <div
              className={`bloqueio-banner`}
              role="status"
              style={{ background: mensagemRenovacao.includes('sucesso') ? '#DCFCE7' : '#FEE2E2', borderColor: mensagemRenovacao.includes('sucesso') ? '#BBF7D0' : '#FECACA', marginBottom: '1.5rem' }}
            >
              {mensagemRenovacao}
            </div>
          )}

          <h2 className="perfil-section-title">Empréstimos e Histórico</h2>

          {carregando ? (
            <div className="perfil-loading" aria-live="polite">Carregando...</div>
          ) : !perfil || perfil.emprestimos.length === 0 ? (
            <p className="perfil-empty">Nenhum empréstimo registrado.</p>
          ) : (
            <div className="emprestimos-lista">
              {perfil.emprestimos.map((emp) => (
                <div key={emp.id} className="emprestimo-item">
                  <div className="emprestimo-info">
                    <h3>{emp.livro.titulo}</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginBottom: '0.25rem' }}>{emp.livro.autor}</p>
                    <p className="emprestimo-datas">
                      Emprestado: {formatarData(emp.dataEmprestimo)}<br />
                      Devolução prevista: {formatarData(emp.dataDevolucaoPrevista)}<br />
                      {emp.dataDevolucaoReal && `Devolvido em: ${formatarData(emp.dataDevolucaoReal)}`}
                      {emp.multa && emp.multa > 0 && (
                        <span style={{ color: '#DC2626', display: 'block' }}>
                          Multa: R$ {emp.multa.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </p>
                    {emp.status === 'ATIVO' && (
                      <button
                        className="btn-renovar"
                        onClick={() => handleRenovar(emp.id)}
                        disabled={renovando === emp.id || !!bloqueado}
                        aria-label={`Renovar empréstimo de ${emp.livro.titulo}`}
                        aria-busy={renovando === emp.id}
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        {renovando === emp.id ? 'Renovando...' : 'Renovar (15 dias)'}
                      </button>
                    )}
                  </div>
                  <span className={`emprestimo-status ${getStatusClass(emp.status)}`} aria-label={`Status: ${emp.status}`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ModalLgpd
        aberto={modalLgpdAberto}
        aoFechar={() => setModalLgpdAberto(false)}
        aoConfirmar={handleLgpdConfirmado}
      />
    </main>
  );
}
