import { useState, type FormEvent } from 'react';
import { Plus, Trash2, CheckCircle, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './CadastrarLivro.css';

// Campos que existem no banco (tabelas books e exemplars das migrations):
// título, autor, edição, ano de impressão e, por exemplar, o volume.
interface FormData {
  titulo: string;
  autor: string;
  editora: string;
  anoPublicacao: string;
}

interface LivroCadastrado {
  exemplares: { id: string; codigoPatrimonio: string }[];
}

const FORM_INICIAL: FormData = {
  titulo: '',
  autor: '',
  editora: '',
  anoPublicacao: '',
};

export default function CadastrarLivro() {
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  // Cada item é um exemplar físico; o texto é o volume (opcional)
  const [exemplares, setExemplares] = useState<string[]>(['']);
  const [erros, setErros] = useState<Partial<Record<keyof FormData, string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [codigosGerados, setCodigosGerados] = useState<string[] | null>(null);
  const [erroGeral, setErroGeral] = useState('');

  function setField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErros((prev) => ({ ...prev, [field]: '' }));
  }

  function addExemplar() {
    setExemplares((prev) => [...prev, '']);
  }

  function removeExemplar(idx: number) {
    setExemplares((prev) => prev.filter((_, i) => i !== idx));
  }

  function setExemplar(idx: number, value: string) {
    setExemplares((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }

  function validar(): boolean {
    const novosErros: typeof erros = {};
    if (!form.titulo.trim()) novosErros.titulo = 'Título é obrigatório.';
    if (!form.autor.trim()) novosErros.autor = 'Autor é obrigatório.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    setCodigosGerados(null);
    setErroGeral('');
    try {
      const { data } = await api.post<LivroCadastrado>('/livros', {
        titulo: form.titulo.trim(),
        autor: form.autor.trim(),
        editora: form.editora.trim(),
        anoPublicacao: form.anoPublicacao ? Number(form.anoPublicacao) : undefined,
        exemplares: exemplares.map((volume) => ({ volume: volume.trim() })),
      });
      setCodigosGerados(data.exemplares.map((ex) => ex.codigoPatrimonio));
      setForm(FORM_INICIAL);
      setExemplares(['']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setErroGeral(msg ?? 'Erro ao cadastrar o livro. Verifique os dados e tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  function handleReset() {
    setForm(FORM_INICIAL);
    setExemplares(['']);
    setErros({});
    setCodigosGerados(null);
    setErroGeral('');
  }

  return (
    <main className="cadastro-page">
      <h1 className="cadastro-title">Cadastrar Livro</h1>
      <p className="cadastro-subtitle">Preencha os dados do título e registre os exemplares físicos. O código de patrimônio de cada exemplar é gerado automaticamente.</p>

      {codigosGerados && (
        <div className="success-banner" role="status" aria-live="polite">
          <CheckCircle size={18} aria-hidden="true" />
          <span>
            Livro cadastrado com sucesso! Códigos de patrimônio gerados: <strong>{codigosGerados.join(', ')}</strong>
          </span>
        </div>
      )}

      {erroGeral && (
        <div className="success-banner" style={{ background: '#FEE2E2', borderColor: '#FECACA', color: '#B91C1C' }} role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          {erroGeral}
        </div>
      )}

      <div className="cadastro-card">
        <form className="cadastro-form" onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro de livro">
          <div className="section-divider">
            <span className="section-divider-label">Dados do Título</span>
            <div className="section-divider-line" />
          </div>

          <div className="form-field">
            <label htmlFor="titulo" className="form-label">Título <span className="required" aria-hidden="true">*</span></label>
            <input id="titulo" type="text" className={`form-input${erros.titulo ? ' invalid' : ''}`} value={form.titulo} onChange={(e) => setField('titulo', e.target.value)} placeholder="Ex: Dom Casmurro" required aria-required="true" aria-describedby={erros.titulo ? 'err-titulo' : undefined} />
            {erros.titulo && <span id="err-titulo" className="form-error" role="alert"><AlertCircle size={12} aria-hidden="true" />{erros.titulo}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="autor" className="form-label">Autor <span className="required" aria-hidden="true">*</span></label>
              <input id="autor" type="text" className={`form-input${erros.autor ? ' invalid' : ''}`} value={form.autor} onChange={(e) => setField('autor', e.target.value)} placeholder="Ex: Machado de Assis" required aria-required="true" />
              {erros.autor && <span className="form-error" role="alert"><AlertCircle size={12} aria-hidden="true" />{erros.autor}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="editora" className="form-label">Edição</label>
              <input id="editora" type="text" className="form-input" value={form.editora} onChange={(e) => setField('editora', e.target.value)} placeholder="Ex: 3ª edição" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="anoPublicacao" className="form-label">Ano de Impressão</label>
              <input id="anoPublicacao" type="number" className="form-input" value={form.anoPublicacao} onChange={(e) => setField('anoPublicacao', e.target.value)} placeholder="Ex: 1899" min="1400" max={new Date().getFullYear()} />
            </div>
          </div>

          <div className="section-divider" style={{ marginTop: '0.5rem' }}>
            <span className="section-divider-label">Exemplares Físicos (ADR-002)</span>
            <div className="section-divider-line" />
          </div>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="form-label" style={{ marginBottom: '0.75rem' }}>
              Um campo para cada exemplar (volume é opcional)
            </legend>

            <div className="exemplares-lista">
              {exemplares.map((volume, idx) => (
                <div key={idx} className="exemplar-row">
                  <label htmlFor={`exemplar-${idx}`} className="sr-only">Volume do exemplar {idx + 1} (opcional)</label>
                  <input
                    id={`exemplar-${idx}`}
                    type="text"
                    className="exemplar-input"
                    value={volume}
                    onChange={(e) => setExemplar(idx, e.target.value)}
                    placeholder={`Exemplar ${idx + 1} — volume (opcional), ex: Vol. 1`}
                  />
                  <button
                    type="button"
                    className="btn-remove-exemplar"
                    onClick={() => removeExemplar(idx)}
                    disabled={exemplares.length === 1}
                    aria-label={`Remover exemplar ${idx + 1}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="btn-add-exemplar" onClick={addExemplar}>
              <Plus size={16} aria-hidden="true" />
              Adicionar exemplar
            </button>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn-reset" onClick={handleReset}>
              Limpar formulário
            </button>
            <button type="submit" className="btn-submit" disabled={enviando} aria-busy={enviando}>
              <Save size={17} aria-hidden="true" />
              {enviando ? 'Cadastrando...' : 'Cadastrar Livro'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
