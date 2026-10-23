import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import loginIllustration from '../../assets/login-illustration.png';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      await login(email.trim(), senha);
      navigate('/acervo');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setErro('E-mail ou senha incorretos. Verifique e tente novamente.');
      } else {
        setErro('Não foi possível conectar ao servidor. Tente novamente em instantes.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <aside className="login-aside" aria-label="Apresentação da Biblioteca Paulo Renato de Souza">
        <div className="login-aside-content">
          <p className="login-eyebrow">Conhecimento que conecta</p>
          <h1 className="login-aside-title">Biblioteca<br /><strong>Paulo Renato de Souza</strong></h1>
          <p className="login-aside-desc">
            Seu espaço para descobrir histórias, ampliar horizontes e construir novos futuros.
          </p>
        </div>
        <img
          className="login-illustration"
          src={loginIllustration}
          alt=""
          aria-hidden="true"
        />
      </aside>

      <main className="login-main">
        <div className="login-form-card">
          <p className="login-form-eyebrow">Área do leitor</p>
          <h2 className="login-form-title">Bem-vindo de volta</h2>
          <p className="login-form-subtitle">Entre com suas credenciais para acessar a biblioteca.</p>

          {erro && (
            <div id="login-erro" className="login-alert" role="alert" aria-live="assertive">
              <AlertCircle size={16} aria-hidden="true" />
              {erro}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                id="email"
                type="email"
                className={`form-input${erro ? ' invalid' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                aria-required="true"
                aria-describedby={erro ? 'login-erro' : undefined}
              />
            </div>

            <div className="form-field">
              <label htmlFor="senha" className="form-label">Senha</label>
              <input
                id="senha"
                type="password"
                className={`form-input${erro ? ' invalid' : ''}`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                aria-required="true"
              />
            </div>

            <button type="submit" className="login-submit" disabled={carregando} aria-busy={carregando}>
              <LogIn size={18} aria-hidden="true" />
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="login-register">
            Ainda não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
