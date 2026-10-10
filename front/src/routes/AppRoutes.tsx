import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Login from '../pages/Login/Login';
import Cadastro from '../pages/Cadastro/Cadastro';
import Acervo from '../pages/Acervo/Acervo';
import MeuPerfil from '../pages/MeuPerfil/MeuPerfil';
import MinhasReservas from '../pages/MinhasReservas/MinhasReservas';
import CadastrarLivro from '../pages/CadastrarLivro/CadastrarLivro';
import GestaoEmprestimos from '../pages/GestaoEmprestimos/GestaoEmprestimos';
import QuitacaoMultas from '../pages/QuitacaoMultas/QuitacaoMultas';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route
        path="/acervo"
        element={
          <ProtectedRoute>
            <Layout><Acervo /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/meu-perfil"
        element={
          <ProtectedRoute>
            <Layout><MeuPerfil /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/minhas-reservas"
        element={
          <ProtectedRoute>
            <Layout><MinhasReservas /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cadastrar-livro"
        element={
          <ProtectedRoute papeis={['BIBLIOTECARIO', 'ADMIN']}>
            <Layout><CadastrarLivro /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/gestao-emprestimos"
        element={
          <ProtectedRoute papeis={['BIBLIOTECARIO', 'ADMIN']}>
            <Layout><GestaoEmprestimos /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/quitacao-multas"
        element={
          <ProtectedRoute papeis={['BIBLIOTECARIO', 'ADMIN']}>
            <Layout><QuitacaoMultas /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/acervo" replace />} />
      <Route path="*" element={<Navigate to="/acervo" replace />} />
    </Routes>
  );
}
