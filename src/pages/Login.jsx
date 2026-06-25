import { useState } from "react";
import api, { getApiError } from "../api";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Completa correo y contrasena.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", form);
      localStorage.setItem("token", response.data.token);
      navigate("/search", { replace: true });
    } catch (err) {
      setError(getApiError(err, "Credenciales incorrectas."));
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return <Navigate to="/search" replace />;
  }

  return (
    <section className="auth-panel">
      <div>
        <p className="section-kicker">Acceso</p>
        <h2 className="section-title">Iniciar sesion</h2>
      </div>

      <form className="form-grid" onSubmit={submit}>
        <label className="field">
          <span>Correo electronico</span>
          <input
            autoComplete="email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="alice@example.com"
          />
        </label>

        <label className="field">
          <span>Contrasena</span>
          <input
            autoComplete="current-password"
            type="password"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="Password1"
          />
        </label>
      {registered && (
      <p className="alert alert-success">Cuenta creada correctamente. Inicia sesión.</p>
      )}
        {error && <p className="alert alert-error">{error}</p>}

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="muted">
        No tienes cuenta? <Link to="/register">Registrate</Link>
      </p>
    </section>
  );
}
