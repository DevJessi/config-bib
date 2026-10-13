import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, User, BookMarked, LogOut, ClipboardList, DollarSign, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoHeader from '../../assets/logo-header.png';
import './Header.css';

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuAberto(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  function handleLogout() {
    setMenuAberto(false);
    logout();
    navigate('/login');
  }

  const isStaff = usuario?.papel === 'BIBLIOTECARIO' || usuario?.papel === 'ADMIN';

  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <NavLink to="/acervo" className="header__brand" aria-label="Biblioteca Paulo Renato de Souza — Página inicial">
          <img className="header__logo" src={logoHeader} alt="" aria-hidden="true" />
          <span className="header__brand-name">Biblioteca<br />Paulo Renato</span>
        </NavLink>

        <nav className="header__nav" aria-label="Navegação principal">
          <NavLink to="/acervo" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}>
            <BookOpen size={16} aria-hidden="true" />
            Acervo
          </NavLink>
          <NavLink to="/minhas-reservas" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}>
            <BookMarked size={16} aria-hidden="true" />
            Minhas Reservas
          </NavLink>
          <NavLink to="/meu-perfil" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}>
            <User size={16} aria-hidden="true" />
            Meu Perfil
          </NavLink>

          {isStaff && (
            <>
              <NavLink to="/cadastrar-livro" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}>
                <BookOpen size={16} aria-hidden="true" />
                Cadastrar Livro
              </NavLink>
              <NavLink to="/gestao-emprestimos" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}>
                <ClipboardList size={16} aria-hidden="true" />
                Empréstimos
              </NavLink>
              <NavLink to="/quitacao-multas" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}>
                <DollarSign size={16} aria-hidden="true" />
                Quitação de Multas
              </NavLink>
            </>
          )}
        </nav>

        <div className="header__user">
          {usuario && (
            <div className="header__user-info" aria-live="polite">
              <span className="header__user-name">{usuario.nome.split(' ')[0]}</span>
              <span className="header__user-role">{usuario.papel}</span>
            </div>
          )}
          <button className="header__logout" onClick={handleLogout} aria-label="Sair da conta">
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </div>

        <button
          type="button"
          className="header__menu-toggle"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label={menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          aria-expanded={menuAberto}
          aria-controls="menu-navegacao-mobile"
        >
          {menuAberto ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      <div
        id="menu-navegacao-mobile"
        className={`header__mobile-drawer${menuAberto ? ' open' : ''}`}
        aria-hidden={!menuAberto}
      >
        {usuario && (
          <div className="header__mobile-user">
            <span className="header__user-name">{usuario.nome}</span>
            <span className="header__user-role">{usuario.papel}</span>
          </div>
        )}
        <nav className="header__mobile-nav" aria-label="Navegação principal mobile">
          <NavLink to="/acervo" className={({ isActive }) => `header__mobile-link${isActive ? ' active' : ''}`}>
            <BookOpen size={19} aria-hidden="true" />
            Acervo
          </NavLink>
          <NavLink to="/minhas-reservas" className={({ isActive }) => `header__mobile-link${isActive ? ' active' : ''}`}>
            <BookMarked size={19} aria-hidden="true" />
            Minhas Reservas
          </NavLink>
          <NavLink to="/meu-perfil" className={({ isActive }) => `header__mobile-link${isActive ? ' active' : ''}`}>
            <User size={19} aria-hidden="true" />
            Meu Perfil
          </NavLink>
          {isStaff && (
            <>
              <NavLink to="/cadastrar-livro" className={({ isActive }) => `header__mobile-link${isActive ? ' active' : ''}`}>
                <BookOpen size={19} aria-hidden="true" />
                Cadastrar Livro
              </NavLink>
              <NavLink to="/gestao-emprestimos" className={({ isActive }) => `header__mobile-link${isActive ? ' active' : ''}`}>
                <ClipboardList size={19} aria-hidden="true" />
                Empréstimos
              </NavLink>
              <NavLink to="/quitacao-multas" className={({ isActive }) => `header__mobile-link${isActive ? ' active' : ''}`}>
                <DollarSign size={19} aria-hidden="true" />
                Quitação de Multas
              </NavLink>
            </>
          )}
        </nav>
        <button type="button" className="header__mobile-logout" onClick={handleLogout}>
          <LogOut size={19} aria-hidden="true" />
          Sair da conta
        </button>
      </div>
    </header>
  );
}
