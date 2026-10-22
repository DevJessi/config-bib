import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react';
import api from '../../services/api';
import './Cadastro.css';

interface CadastroForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

const formInicial: CadastroForm = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
};

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(formInicial);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  function atualizarCampo(campo: keyof CadastroForm, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.nome.trim() || !form.email.trim() || !form.senha || !form.confirmarSenha) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setErro('A senha e a confirmação precisam ser iguais.');
      return;
    }

    setErro('');
    setCarregando(true);
    try {
      await api.post('/leitores', {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
      });
      setSucesso('Cadastro realizado com sucesso. Redirecionando para o login...');
      setForm(formInicial);
      window.setTimeout(() => navigate('/login'), 1600);
    } catch (error: unknown) {
      const resposta = (error as {
        response?: { status?: number; data?: { message?: string } };
      }).response;
      if (resposta?.status === 409) {
        setErro('Já existe uma conta cadastrada com este e-mail.');
      } else {
        setErro(resposta?.data?.message ?? 'Não foi possível concluir o cadastro. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-page">
      <section className="cadastro-card" aria-labelledby="cadastro-titulo">
        <Link to="/login" className="cadastro-back">
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para o login
        </Link>

        <div className="cadastro-heading">
          <span className="cadastro-icon" aria-hidden="true">
            <UserPlus size={26} />
          </span>
          <p className="cadastro-eyebrow">Novo leitor</p>
          <h1 id="cadastro-titulo">Crie sua conta</h1>
          <p>Cadastre-se para consultar o acervo e acompanhar suas reservas.</p>
        </div>

        {erro && (
          <div id="cadastro-erro" className="cadastro-alert error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="cadastro-alert success" role="status" aria-live="polite">
            <CheckCircle size={18} aria-hidden="true" />
            {sucesso}
          </div>
        )}

        <form className="cadastro-form" onSubmit={handleSubmit} noValidate>
          <div className="cadastro-field">
            <label htmlFor="cadastro-nome">Nome completo</label>
            <input
              id="cadastro-nome"
              type="text"
              value={form.nome}
              onChange={(event) => atualizarCampo('nome', event.target.value)}
              autoComplete="name"
              required
              disabled={carregando || Boolean(sucesso)}
              aria-describedby={erro ? 'cadastro-erro' : undefined}
            />
          </div>

          <div className="cadastro-field">
            <label htmlFor="cadastro-email">E-mail</label>
            <input
              id="cadastro-email"
              type="email"
              value={form.email}
              onChange={(event) => atualizarCampo('email', event.target.value)}
              autoComplete="email"
              inputMode="email"
              required
              disabled={carregando || Boolean(sucesso)}
            />
          </div>

          <div className="cadastro-form-row">
            <div className="cadastro-field">
              <label htmlFor="cadastro-senha">Senha</label>
              <input
                id="cadastro-senha"
                type="password"
                value={form.senha}
                onChange={(event) => atualizarCampo('senha', event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={carregando || Boolean(sucesso)}
              />
              <small>Mínimo de 8 caracteres</small>
            </div>

            <div className="cadastro-field">
              <label htmlFor="cadastro-confirmar-senha">Confirmação de senha</label>
              <input
                id="cadastro-confirmar-senha"
                type="password"
                value={form.confirmarSenha}
                onChange={(event) => atualizarCampo('confirmarSenha', event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={carregando || Boolean(sucesso)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="cadastro-submit"
            disabled={carregando || Boolean(sucesso)}
            aria-busy={carregando}
          >
            <UserPlus size={18} aria-hidden="true" />
            {carregando ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>

        <p className="cadastro-login">
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
