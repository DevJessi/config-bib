import { Navigate } from 'react-router-dom';
import type { Papel } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  papeis?: Papel[];
}

export default function ProtectedRoute({ children, papeis }: ProtectedRouteProps) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div aria-live="polite" aria-label="Carregando...">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="16" stroke="#CCD3FF" strokeWidth="4" />
            <path d="M20 4 A16 16 0 0 1 36 20" stroke="#6178FC" strokeWidth="4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to="/acervo" replace />;
  }

  return <>{children}</>;
}
