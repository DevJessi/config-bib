import { useState, type FormEvent } from 'react';
import { Plus, Trash2, CheckCircle, Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './CadastrarLivro.css';

interface FormData {
  titulo: string;
  autor: string;
  isbn: string;
  categoria: string;
  editora: string;
  anoPublicacao: string;
  sinopse: string;
}

const FORM_INICIAL: FormData = {
  titulo: '',
  autor: '',
  isbn: '',
  categoria: '',
  editora: '',
  anoPublicacao: '',
  sinopse: '',
};

const CATEGORIAS = [
  'Ficção Científica', 'Romance', 'Suspense', 'Terror', 'Fantasia',
  'Biografia', 'História', 'Filosofia', 'Ciências', 'Tecnologia',
  'Direito', 'Administração', 'Psicologia', 'Literatura Brasileira',
  'Literatura Internacional', 'Infantil', 'Didático', 'Outros',
];

export default function CadastrarLivro() {
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [exemplares, setExemplares] = useState<string[]>(['']);
  const [erros, setErros] = useState<Partial<Record<keyof FormData | 'exemplares', string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
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
    setErros((prev) => ({ ...prev, exemplares: '' }));
  }

  function validar(): boolean {
    const novosErros: typeof erros = {};
    if (!form.titulo.trim()) novosErros.titulo = 'Título é obrigatório.';
    if (!form.autor.trim()) novosErros.autor = 'Autor é obrigatório.';
    if (!form.isbn.trim()) novosErros.isbn = 'ISBN é obrigatório.';
    if (!form.categoria) novosErros.categoria = 'Selecione uma categoria.';
    const codigosValidos = exemplares.map((e) => e.trim()).filter(Boolean);
    if (codigosValidos.length === 0) novosErros.exemplares = 'Adicione ao menos um exemplar com código de patrimônio.';
    const duplicados = new Set(codigosValidos).size !== codigosValidos.length;
    if (duplicados) novosErros.exemplares = 'Códigos de patrimônio duplicados não são permitidos.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    setSucesso(false);
    setErroGeral('');
    try {
      await api.post('/livros', {
        ...form,
        anoPublicacao: form.anoPublicacao ? Number(form.anoPublicacao) : undefined,
        exemplares: exemplares.map((e) => e.trim()).filter(Boolean).map((cod) => ({ codigoPatrimonio: cod })),
      });
      setSucesso(true);
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
    setSucesso(false);
    setErroGeral('');
  }

  return (
    <main className="cadastro-page">
      <h1 className="cadastro-title">Cadastrar Livro</h1>
      <p className="cadastro-subtitle">Preencha os dados do título e registre os exemplares físicos com seus códigos de patrimônio.</p>

      {sucesso && (
        <div className="success-banner" role="status" aria-live="polite">
          <CheckCircle size={18} aria-hidden="true" />
          Livro cadastrado com sucesso! Você pode cadastrar outro título abaixo.
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
              <label htmlFor="isbn" className="form-label">ISBN <span className="required" aria-hidden="true">*</span></label>
              <input id="isbn" type="text" className={`form-input${erros.isbn ? ' invalid' : ''}`} value={form.isbn} onChange={(e) => setField('isbn', e.target.value)} placeholder="978-85-00000-00-0" required aria-required="true" />
              {erros.isbn && <span className="form-error" role="alert"><AlertCircle size={12} aria-hidden="true" />{erros.isbn}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="categoria" className="form-label">Categoria <span className="required" aria-hidden="true">*</span></label>
              <select id="categoria" className={`form-select${erros.categoria ? ' invalid' : ''}`} value={form.categoria} onChange={(e) => setField('categoria', e.target.value)} required aria-required="true">
                <option value="">Selecione...</option>
                {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {erros.categoria && <span className="form-error" role="alert"><AlertCircle size={12} aria-hidden="true" />{erros.categoria}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="editora" className="form-label">Editora</label>
              <input id="editora" type="text" className="form-input" value={form.editora} onChange={(e) => setField('editora', e.target.value)} placeholder="Ex: Companhia das Letras" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="anoPublicacao" className="form-label">Ano de Publicação</label>
              <input id="anoPublicacao" type="number" className="form-input" value={form.anoPublicacao} onChange={(e) => setField('anoPublicacao', e.target.value)} placeholder="Ex: 1899" min="1400" max={new Date().getFullYear()} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="sinopse" className="form-label">Sinopse</label>
            <textarea id="sinopse" className="form-textarea" value={form.sinopse} onChange={(e) => setField('sinopse', e.target.value)} placeholder="Breve descrição do livro..." rows={3} />
          </div>

          <div className="section-divider" style={{ marginTop: '0.5rem' }}>
            <span className="section-divider-label">Exemplares Físicos (ADR-002)</span>
            <div className="section-divider-line" />
          </div>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="form-label" style={{ marginBottom: '0.75rem' }}>
              Códigos de Patrimônio <span className="required" aria-hidden="true">*</span>
            </legend>

            {erros.exemplares && (
              <span className="form-error" role="alert" style={{ marginBottom: '0.5rem' }}>
                <AlertCircle size={12} aria-hidden="true" />{erros.exemplares}
              </span>
            )}

            <div className="exemplares-lista">
              {exemplares.map((cod, idx) => (
                <div key={idx} className="exemplar-row">
                  <label htmlFor={`exemplar-${idx}`} className="sr-only">Código de patrimônio do exemplar {idx + 1}</label>
                  <input
                    id={`exemplar-${idx}`}
                    type="text"
                    className="exemplar-input"
                    value={cod}
                    onChange={(e) => setExemplar(idx, e.target.value)}
                    placeholder={`Patrimônio ${idx + 1} — ex: PAT-2024-00${idx + 1}`}
                    aria-required="true"
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
