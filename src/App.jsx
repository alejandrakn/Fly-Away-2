import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reservations from "./pages/Reservations";
import Search from "./pages/Search";

function Shell({ children }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setCurrentUser(null);
      return;
    }
    import("./api").then(({ default: api }) => {
      api.get("/users/current")
        .then(r => setCurrentUser(r.data))
        .catch(() => setCurrentUser(null));
    });
  }, [isLoggedIn]);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const handleStorageChange = () => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" onClick={handleStorageChange} onFocus={handleStorageChange}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Fly Away</p>
            <h1 className="text-2xl font-bold">Reserva de vuelos</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {isLoggedIn ? (
              <>
                <NavLink className="nav-link" to="/search">
                  Busqueda
                </NavLink>
                <NavLink className="nav-link" to="/reservations">
                  Reservas
                </NavLink>
                {currentUser && (
                  <span className="muted">Hola, {currentUser.firstName}</span>
                )}
                <button className="btn btn-secondary" type="button" onClick={logout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink className="nav-link" to="/register">
                  Registro
                </NavLink>
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <Reservations />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;