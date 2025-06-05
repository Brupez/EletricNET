package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ua.tqs.dto.AdminStatsDTO;
import ua.tqs.dto.ReservationRequestDTO;
import ua.tqs.dto.ReservationResponseDTO;
import ua.tqs.login.JwtUtil;
import ua.tqs.models.User;
import ua.tqs.repositories.UserRepository;
import ua.tqs.services.ReservationService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost", allowCredentials = "true")
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public ReservationController(ReservationService reservationService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        List<ReservationResponseDTO> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/create")
    public ResponseEntity<ReservationResponseDTO> createReservation(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ReservationRequestDTO dto) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtUtil.getUsername(token);
            Optional<User> user = userRepository.findByEmail(userEmail);

            if (user.isEmpty()) {
                return ResponseEntity.status(403).build();
            }

            // Verify the user ID matches the token
            if (!user.get().getId().equals(dto.getUserId())) {
                return ResponseEntity.status(403).build();
            }

            Optional<ReservationResponseDTO> reservation = reservationService.createReservation(dto);
            return reservation
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }


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
