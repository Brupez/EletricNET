package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ua.tqs.dto.AdminStatsDTO;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;
import ua.tqs.services.ReservationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    public ReservationService reservationService;

    @GetMapping("/all")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        List<ReservationResponseDTO> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/create")
    public ResponseEntity<ReservationResponseDTO> createReservation(@RequestBody ReservationRequestDTO dto) {
        Optional<ReservationResponseDTO> reservation = reservationService.createReservation(dto);
        return reservation
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelReservation(@PathVariable Long id) {
        boolean success = reservationService.cancelReservation(id);
        if (success) {
            return ResponseEntity.ok("Reservation successfully cancelled.");
        } else {
            return ResponseEntity.badRequest().body("Reservation not found or already cancelled.");
        }
    }

    @GetMapping("/myReservations")
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        List<ReservationResponseDTO> reservations = reservationService.getReservationsByToken(token);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenue() {
        double totalRevenue = reservationService.getTotalRevenue();

        Map<String, Object> revenue = new HashMap<>();
        revenue.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(revenue);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slot/{slotId}/active")
    public ResponseEntity<List<ReservationResponseDTO>> getActiveReservationsBySlot(@PathVariable Long slotId) {
        List<ReservationResponseDTO> reservations = reservationService.getActiveReservationsBySlotId(slotId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/myStats")
    public ResponseEntity<?> getMyStats(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        var stats = reservationService.getClientStats(token);

        if (stats == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<AdminStatsDTO> getAdminStats() {
        AdminStatsDTO dto = new AdminStatsDTO();
        dto.setCurrentMonthRevenue(reservationService.getCurrentMonthRevenue());
        return ResponseEntity.ok(dto);
    }
}
