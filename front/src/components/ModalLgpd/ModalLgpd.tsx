import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import './ModalLgpd.css';

const FRASE_CONFIRMACAO = 'DESEJO_EXCLUIR_MEUS_DADOS';

interface ModalLgpdProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void;
}

export default function ModalLgpd({ aberto, aoFechar, aoConfirmar }: ModalLgpdProps) {
  const [confirmacao, setConfirmacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setConfirmacao('');
      setErro('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [aberto]);

  async function handleConfirmar() {
    if (confirmacao !== FRASE_CONFIRMACAO) {
      setErro('A frase digitada não confere. Tente novamente.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await api.delete('/leitores/me/lgpd', { data: { confirmacao: FRASE_CONFIRMACAO } });
      aoConfirmar();
    } catch {
      setErro('Erro ao processar a solicitação. Tente novamente mais tarde.');
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') aoFechar();
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content"
          aria-describedby="modal-lgpd-desc"
          onKeyDown={handleKeyDown}
        >
          <div className="modal-header">
            <div className="modal-icon" aria-hidden="true">
              <Trash2 size={22} />
            </div>
            <div>
              <Dialog.Title className="modal-title">Solicitar Exclusão de Dados (LGPD)</Dialog.Title>
              <p className="modal-subtitle" id="modal-lgpd-desc">
                Esta ação é irreversível. Seus dados serão expurgados em até 48 horas.
              </p>
            </div>
          </div>

          <div className="modal-body">
            <div className="modal-warning" role="alert">
              <strong>Atenção:</strong> Após a confirmação, sua conta e todos os seus dados pessoais serão permanentemente removidos do sistema conforme a LGPD (Lei nº 13.709/2018). Esta ação não pode ser desfeita.
            </div>

            <label htmlFor="lgpd-confirmacao" className="modal-label">
              Para confirmar, digite exatamente a frase abaixo:
            </label>
            <span className="modal-phrase" aria-label={`Frase de confirmação: ${FRASE_CONFIRMACAO}`}>
              {FRASE_CONFIRMACAO}
            </span>

            <input
              ref={inputRef}
              id="lgpd-confirmacao"
              type="text"
              value={confirmacao}
              onChange={(e) => { setConfirmacao(e.target.value); setErro(''); }}
              className={`modal-input${erro ? ' invalid' : ''}`}
              placeholder="Digite a frase acima..."
              aria-invalid={!!erro}
              aria-describedby={erro ? 'lgpd-erro' : undefined}
              autoComplete="off"
              spellCheck={false}
            />

            {erro && (
              <p id="lgpd-erro" className="modal-error" role="alert">
                <AlertTriangle size={14} aria-hidden="true" />
                {erro}
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={aoFechar} type="button">
              <X size={14} aria-hidden="true" style={{ display: 'inline', marginRight: 4 }} />
              Cancelar
            </button>
            <button
              className="modal-btn-confirm"
              onClick={handleConfirmar}
              disabled={enviando || confirmacao !== FRASE_CONFIRMACAO}
              type="button"
              aria-busy={enviando}
            >
              <Trash2 size={14} aria-hidden="true" />
              {enviando ? 'Processando...' : 'Confirmar Exclusão'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
