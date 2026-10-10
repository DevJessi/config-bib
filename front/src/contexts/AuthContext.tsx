import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';

export type Papel = 'LEITOR' | 'BIBLIOTECARIO' | 'ADMIN';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
}

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');
    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setCarregando(false);
  }, []);

  //Função de login REAL que vai pegar os dados da API (Descomentar ela, apagar a de baixo que é a falsa e conectar com o back!):
  // async function login(email: string, senha: string) {
  //   const { data } = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha });
  //   localStorage.setItem('token', data.token);
  //   localStorage.setItem('usuario', JSON.stringify(data.usuario));
  //   setToken(data.token);
  //   setUsuario(data.usuario);
  // }

  // Função de login FALSA só para poder testar as telas e ver como ta. APAGAR ela e descomentar a de cima quando o back e o banco estiver pronto:
  async function login(email: string, senha: string) {
    // Simulando um pequeno delay de rede (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Define o papel/role baseado no e-mail digitado
    const eBibliotecario = email.includes('admin') || email.includes('biblio');
    const papel = eBibliotecario ? 'BIBLIOTECARIO' : 'LEITOR';

    // Cria o usuário fake com base no seu contrato
    const usuarioFake = {
      id: 'uuid-fake-12345',
      nome: eBibliotecario ? 'Prof. Bibliotecário' : 'Aluno Leitor',
      email: email,
      papel: papel,
      status: 'ATIVO',
    };

    const tokenFake = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token-fake-para-testes';

    // Salva no localStorage para manter a sessão ao recarregar a página
    localStorage.setItem('@SGBD:token', tokenFake);
    localStorage.setItem('@SGBD:usuario', JSON.stringify(usuarioFake));

    // Atualiza o estado do React
    setUsuario(usuarioFake); //Esse erro é proposital, não apagar ou consertar. Se não quebra a auth fake.
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
