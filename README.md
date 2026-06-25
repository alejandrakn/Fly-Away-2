# Fly Away - Reserva de Vuelos

Frontend desarrollado en React + Vite que consume una API REST de gestión de vuelos.

## Instrucciones para correr el proyecto

1. Iniciar el backend (desde la carpeta `backend/`):
```bash
   ./mvnw spring-boot:run
```

2. Instalar dependencias e iniciar el frontend (desde la raíz del proyecto):
```bash
   npm install
   npm run dev
```

3. Abrir en el navegador: `http://localhost:5173`

## Cumplimiento de desafíos

| Desafío | Descripción | Cumplido |
|---|---|---|
| Registro | Formulario con email, nombre, apellido y contraseña. Validación de campos vacíos, errores del backend, mensaje de éxito y redirección al login. | ✅ |
| Login | Formulario con email y contraseña. Guarda token JWT en localStorage, muestra error si credenciales incorrectas, redirige a búsqueda y muestra nombre del usuario autenticado. | ✅ |
| Búsqueda de vuelos | Consume `GET /flights/search` sin protección. Filtros por número de vuelo, aerolínea y rango de fechas. Resultados en tabla con número, aerolínea, salida, llegada y asientos. Mensaje amigable si no hay resultados. | ✅ |
| Reservar un vuelo | Botón "Reservar" por vuelo. Consume `POST /flights/book` con token. Muestra mensaje de éxito con ID de reserva y errores del backend. Link al detalle de la reserva. | ✅ |
| Mis Reservas | IDs guardados en localStorage. Lista con número de vuelo, aerolínea y fecha de salida. Solo accesible para usuarios autenticados. | ✅ |
| Cerrar sesión y navegación | Botón de logout limpia el token. Rutas protegidas redirigen al login si no hay token. Navegación clara: Registro → Login → Búsqueda → Reserva. | ✅ |
