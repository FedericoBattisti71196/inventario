import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <Link to="/" className="brand">
            Inventario
          </Link>
        </div>
        <div className="topbar-actions">
          <Link to="/items/new" className="btn ghost">
            Nuovo
          </Link>
          <span className="muted">{user?.username}</span>
          <button type="button" className="btn ghost" onClick={logout}>
            Esci
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
