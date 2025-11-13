import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand">Início</Link>

        <div>
          {user ? (
            <>
              <span className="text-light me-3">Olá, {user.name}</span>
              <Link to="/my-reservations" className="btn btn-outline-light me-2">
                Minhas Reservas
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-warning me-2">
                  Painel do Administrador
                </Link>
              )}
              <button className="btn btn-outline-light" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
              <Link to="/register" className="btn btn-light">Registrar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
