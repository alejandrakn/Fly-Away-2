import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../api";

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "-";
}

function bookingStorageKey(user) {
  return `bookingIds:${user?.id || user?.username || "current"}`;
}

function getStoredBookingIds(user) {
  return JSON.parse(localStorage.getItem(bookingStorageKey(user)) || "[]");
}

export default function Reservations() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);

      let currentUser = null;
      try {
        const userResponse = await api.get("/users/current");
        currentUser = userResponse.data;
        setUser(currentUser);
      } catch (err) {
        setError(getApiError(err, "No se pudo obtener el usuario autenticado."));
        setLoading(false);
        return;
      }

      const ids = getStoredBookingIds(currentUser);
      const results = [];

      for (const id of ids) {
        try {
          const bookingResponse = await api.get(`/flights/book/${id}`);
          const flightResponse = await api.get(`/flights/${bookingResponse.data.flightId}`);
          results.push({
            ...bookingResponse.data,
            airlineName: flightResponse.data.airlineName,
          });
        } catch (err) {
          setError(getApiError(err, "Algunas reservas no pudieron cargarse."));
        }
      }

      setBookings(results);
      setLoading(false);
    };

    load();
  }, []);

  const clearLocalHistory = () => {
    localStorage.removeItem(bookingStorageKey(user));
    setBookings([]);
  };

  return (
    <div className="space-y-6">
      <section className="page-heading">
        <div>
          <p className="section-kicker">Reservas</p>
          <h2 className="section-title">Mis reservas</h2>
        </div>
        {bookings.length > 0 && (
          <button className="btn btn-secondary" type="button" onClick={clearLocalHistory}>
            Limpiar historial local
          </button>
        )}
      </section>

      {error && <p className="alert alert-error">{error}</p>}

      <section className="panel">
        {loading ? (
          <p className="empty-state">Cargando reservas...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <p>No tienes reservas guardadas en este navegador.</p>
            <Link to="/search">Buscar vuelos</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vuelo</th>
                  <th>Aerolinea</th>
                  <th>Fecha de salida</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td className="font-semibold">{booking.flightNumber}</td>
                    <td>{booking.airlineName || "-"}</td>
                    <td>{formatDate(booking.estDepartureTime)}</td>
                    <td>Reserva creada el {formatDate(booking.bookingDate)}</td>
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
