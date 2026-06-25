import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { publicApi, getApiError } from "../api";

const emptySearch = {
  flightNumber: "",
  airlineName: "",
  estDepartureTimeFrom: "",
  estDepartureTimeTo: "",
};

function toIso(value, endOfDay = false) {
  if (!value) return undefined;
  const d = new Date(value);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  }
  return d.toISOString();
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function bookingStorageKey(user) {
  return `bookingIds:${user?.id || user?.username || "current"}`;
}

function saveBookingId(id, user) {
  const key = bookingStorageKey(user);
  const ids = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(key, JSON.stringify([...new Set([...ids, id])]));
}

export default function Search() {
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState(emptySearch);
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const hasFlights = flights.length > 0;

  const params = useMemo(() => {
    return {
      flightNumber: filters.flightNumber || undefined,
      airlineName: filters.airlineName || undefined,
      estDepartureTimeFrom: toIso(filters.estDepartureTimeFrom),
      estDepartureTimeTo: toIso(filters.estDepartureTimeTo, true),
    };
  }, [filters]);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get("/users/current");
      setUser(response.data);
    } catch {
      setUser(null);
    }
  };

  const search = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);
      const response = await publicApi.get("/flights/search", { params });
      setFlights(response.data.items || []);
      setSearched(true);
    } catch (err) {
      setError(getApiError(err, "No se pudo buscar vuelos."));
      setFlights([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const reserve = async (flightId) => {
    setError("");
    setMessage("");
    setBookingId(null);

    try {
      const response = await api.post("/flights/book", { flightId });
      saveBookingId(response.data.id, user);
      setBookingId(response.data.id);
      setMessage(`Reserva creada correctamente. ID de reserva: ${response.data.id}.`);
      await search();
    } catch (err) {
      setError(getApiError(err, "No se pudo reservar el vuelo."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="section-kicker">Vuelos</p>
          <h2 className="section-title">Buscar y reservar</h2>
        </div>
        {user && <p className="badge">Sesión: {user.username || user.email}</p>}
      </section>

      {(message || error) && (
        <div className="space-y-3">
          {message && (
            <p className="alert alert-success">
              {message}{" "}
              {bookingId && <Link to="/reservations">Ver reserva #{bookingId}</Link>}
            </p>
          )}
          {error && <p className="alert alert-error">{error}</p>}
        </div>
      )}

      <section className="panel">
        <div>
          <p className="section-kicker">Filtros</p>
          <h3 className="panel-title">Buscar vuelos disponibles</h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <label className="field">
            <span>Número de vuelo</span>
            <input
              value={filters.flightNumber}
              onChange={(e) => updateFilter("flightNumber", e.target.value)}
              placeholder="LA2050"
            />
          </label>

          <label className="field">
            <span>Aerolínea</span>
            <input
              value={filters.airlineName}
              onChange={(e) => updateFilter("airlineName", e.target.value)}
              placeholder="LATAM"
            />
          </label>

          <label className="field">
            <span>Salida desde</span>
            <input
              type="date"
              value={filters.estDepartureTimeFrom}
              onChange={(e) => updateFilter("estDepartureTimeFrom", e.target.value)}
            />
          </label>

          <label className="field">
            <span>Salida hasta</span>
            <input
              type="date"
              value={filters.estDepartureTimeTo}
              onChange={(e) => updateFilter("estDepartureTimeTo", e.target.value)}
            />
          </label>

          <button
            className="btn btn-primary self-end"
            disabled={loading}
            type="button"
            onClick={search}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="panel-title">Resultados</h3>
          {searched && <p className="muted">{flights.length} vuelo(s) encontrado(s)</p>}
        </div>

        {!searched ? (
          <p className="empty-state">Usa los filtros para buscar vuelos.</p>
        ) : !hasFlights ? (
          <p className="empty-state">
            No se encontraron vuelos para los filtros seleccionados. Intenta cambiar el número de
            vuelo, aerolínea o rango de fechas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Aerolínea</th>
                  <th>Salida</th>
                  <th>Llegada</th>
                  <th>Asientos</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr key={flight.id}>
                    <td className="font-semibold">{flight.flightNumber}</td>
                    <td>{flight.airlineName}</td>
                    <td>{formatDate(flight.estDepartureTime)}</td>
                    <td>{formatDate(flight.estArrivalTime)}</td>
                    <td>{flight.availableSeats}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        disabled={flight.availableSeats <= 0}
                        type="button"
                        onClick={() => reserve(flight.id)}
                      >
                        {flight.availableSeats <= 0 ? "Sin asientos" : "Reservar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}