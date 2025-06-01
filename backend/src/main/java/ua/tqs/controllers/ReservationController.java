package ua.tqs.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping
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
                System.out.println("User not found for email: " + userEmail);
                return ResponseEntity.status(403).build();
            }

            // Verify the user ID matches the token
            if (!user.get().getId().equals(dto.getUserId())) {
                System.out.println("User ID in token does not match the provided user ID.");
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
}
