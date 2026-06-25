import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { getApiError } from "../api";

const initialForm = {
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Completa todos los campos.");
      return;
    }

    const capitalized = (value) => /^[A-Z].+/.test(value.trim());
    if (!capitalized(form.firstName)) {
      setError("El nombre debe empezar con mayúscula.");
      return;
    }

    if (!capitalized(form.lastName)) {
      setError("El apellido debe empezar con mayúscula.");
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(form.password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número."
      );
      return;
    }

    try {
  setLoading(true);
  await api.post("/users/register", {
    ...form,
    username: form.email,
  });
  navigate("/login", { replace: true, state: { registered: true } });
  }catch (err) {
      setError(
        getApiError(
          err,
          "No se pudo registrar. Revisa que el nombre empiece con mayúscula y la contraseña tenga 8 caracteres, una mayúscula y un número."
        )
      );
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
        <p className="section-kicker">Nueva cuenta</p>
        <h2 className="section-title">Registro de usuario</h2>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span>Nombre</span>
            <input
              autoComplete="given-name"
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              placeholder="Alice"
            />
          </label>

          <label className="field">
            <span>Apellido</span>
            <input
              autoComplete="family-name"
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              placeholder="Smith"
            />
          </label>
        </div>

        <label className="field">
          <span>Contrasena</span>
          <input
            autoComplete="new-password"
            type="password"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="Password1"
          />
        </label>

        {error && <p className="alert alert-error">{error}</p>}

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="muted">
        Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
      </p>
    </section>
  );
}
