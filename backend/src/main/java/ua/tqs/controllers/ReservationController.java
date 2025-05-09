package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;
import ua.tqs.services.ReservationService;

import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/create")
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequestDTO dto) {
        Optional<ReservationResponseDTO> reservation = reservationService.createReservation(dto);
        if (reservation.isPresent()) {
            return ResponseEntity.ok(reservation.get());
        } else {
            return ResponseEntity.badRequest().body("Invalid reservation or unavailable slot.");
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        boolean success = reservationService.cancelReservation(id);
        if (success) {
            return ResponseEntity.ok("Reservation successfully cancelled.");
        } else {
            return ResponseEntity.badRequest().body("Reservation not found or already cancelled.");
        }
    }
}
