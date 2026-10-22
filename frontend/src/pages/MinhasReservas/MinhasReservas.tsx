import { useEffect, useState } from 'react';
import { BookMarked, X, Clock } from 'lucide-react';
import api from '../../services/api';
import './MinhasReservas.css';
import { Link } from 'react-router-dom';

interface Reserva {
  id: string;
  livro: { titulo: string; autor: string };
  dataSolicitacao: string;
  dataExpiracao: string | null;
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA';
  posicaoFila?: number;
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function statusClass(status: string) {
  return status.toLowerCase();
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  async function fetchReservas() {
    setCarregando(true);
    try {
      const { data } = await api.get<Reserva[]>('/reservas/minhas');
      setReservas(data);
    } catch {
      setErro('Não foi possível carregar suas reservas.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    fetchReservas();
  }, []);

  async function handleCancelar(id: string) {
    setCancelando(id);
    setErro('');
    try {
      await api.delete(`/reservas/${id}`);
      setReservas((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setErro('Não foi possível cancelar a reserva.');
    } finally {
      setCancelando(null);
    }
  }

  const ativas = reservas.filter((r) => r.status !== 'CANCELADA');

  return (
    <main className="reservas-page">
      <h1 className="reservas-title">Minhas Reservas</h1>
      <p className="reservas-subtitle">Acompanhe suas reservas e posição na fila de espera.</p>

      {erro && <div style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: '1rem' }} role="alert">{erro}</div>}

      {carregando ? (
        <div className="reservas-loading" aria-live="polite" aria-label="Carregando reservas">
          <Clock size={40} strokeWidth={1.5} />
          <p>Carregando suas reservas...</p>
        </div>
      ) : ativas.length === 0 ? (
        <div className="reservas-empty">
          <BookMarked size={52} strokeWidth={1} className="reservas-empty-icon" aria-hidden="true" />
          <p className="reservas-empty-text">Você não possui reservas ativas no momento.</p>
          <p style={{ fontSize: '0.875rem', color: '#9CA9FF', marginTop: '0.5rem' }}>
          Acesse o <Link to="/acervo">Acervo</Link> para reservar um livro.
          </p>
        </div>
      ) : (
        <div className="reservas-lista" role="list" aria-label="Lista de reservas">
          {ativas.map((reserva) => (
            <article key={reserva.id} className="reserva-card" role="listitem" aria-label={`Reserva: ${reserva.livro.titulo}`}>
              <div className="reserva-icon-wrap" aria-hidden="true">
                <BookMarked size={24} />
              </div>
              <div className="reserva-info">
                <h2 className="reserva-titulo">{reserva.livro.titulo}</h2>
                <p className="reserva-autor">{reserva.livro.autor}</p>
                <div className="reserva-meta">
                  <span>Solicitada em {formatarData(reserva.dataSolicitacao)}</span>
                  {reserva.dataExpiracao && <span>Expira em {formatarData(reserva.dataExpiracao)}</span>}
                  {reserva.posicaoFila && reserva.posicaoFila > 1 && (
                    <span>Fila: {reserva.posicaoFila}ª posição</span>
                  )}
                </div>
              </div>
              <div className="reserva-actions">
                <span className={`reserva-status-badge ${statusClass(reserva.status)}`} aria-label={`Status: ${reserva.status}`}>
                  {reserva.status}
                </span>
                {reserva.status !== 'CANCELADA' && (
                  <button
                    className="btn-cancelar-reserva"
                    onClick={() => handleCancelar(reserva.id)}
                    disabled={cancelando === reserva.id}
                    aria-label={`Cancelar reserva de ${reserva.livro.titulo}`}
                    aria-busy={cancelando === reserva.id}
                  >
                    <X size={14} aria-hidden="true" />
                    {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
