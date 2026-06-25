// flight.ts
export interface Flight {
  id: number;
  flightNumber: string;
  airlineName: string;
  departureDate: string;
  arrivalDate: string;
  availableSeats: number;
  estDepartureTime: string;
  estArrivalTime: string;
}

export interface Booking {
  id: number;
  flightId: number;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  status?: string;
}